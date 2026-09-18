"""Local article metadata extractor. Do not expose this port publicly."""

from __future__ import annotations

import json
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer


def extract(html: str, url: str) -> dict:
    title = author = date = description = text = ""
    try:
        import trafilatura

        downloaded = html or trafilatura.fetch_url(url)
        data = trafilatura.extract(
            downloaded,
            url=url,
            output_format="json",
            with_metadata=True,
        )
        if data:
            parsed = json.loads(data)
            title = parsed.get("title") or ""
            author = parsed.get("author") or ""
            date = parsed.get("date") or ""
            description = parsed.get("description") or ""
            text = (parsed.get("text") or "")[:400]
    except Exception:
        pass
    if not title:
        try:
            from newsplease import NewsPlease

            article = NewsPlease.from_html(html, url=url)
            title = article.title or title
            author = article.authors[0] if article.authors else author
            date = str(article.date_publish or date)
            description = article.description or description
            text = (article.maintext or text)[:400]
        except Exception:
            pass
    return {
        "title": title,
        "author": author,
        "publishedAt": date,
        "description": description,
        "excerpt": text[:400],
        "canonicalUrl": url,
    }


class Handler(BaseHTTPRequestHandler):
    def do_POST(self) -> None:  # noqa: N802
        if self.path != "/extract":
            self.send_response(404)
            self.end_headers()
            return
        length = int(self.headers.get("Content-Length", "0"))
        payload = json.loads(self.rfile.read(length) or b"{}")
        result = extract(payload.get("html") or "", payload.get("url") or "")
        body = json.dumps(result).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, format: str, *args: object) -> None:
        return


if __name__ == "__main__":
    ThreadingHTTPServer(("127.0.0.1", 8788), Handler).serve_forever()
