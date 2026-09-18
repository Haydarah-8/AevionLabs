import {
  getSiteUrl,
  SITE_NAME,
  SITE_EMAIL_INFO,
  DEFAULT_DESCRIPTION,
} from "@/lib/site";

/**
 * Organization + WebSite structured data.
 */
export function JsonLd() {
  const url = getSiteUrl();
  const logo = `${url}/icon.svg`;

  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url,
    logo: { "@type": "ImageObject", url: logo },
    description: DEFAULT_DESCRIPTION,
    email: SITE_EMAIL_INFO,
    knowsAbout: [
      "Web design",
      "Web development",
      "User experience",
      "Design systems",
      "Next.js",
    ],
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url,
    description: DEFAULT_DESCRIPTION,
    inLanguage: "en-GB",
    publisher: { "@type": "Organization", name: SITE_NAME, url },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organization),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(website),
        }}
      />
    </>
  );
}
