# Python extract sidecar (Trafilatura, then news-please). Bind localhost only.

```bash
cd workers/news-extract
python -m pip install -r requirements.txt
python server.py
```

The ingest worker calls `http://127.0.0.1:8788/extract`. If this process is not running, Node falls back to JSON-LD and Readability.
