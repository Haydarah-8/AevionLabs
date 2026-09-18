import { TalkForm } from "@/components/talk/TalkForm";
import { PageJsonLd } from "@/components/seo/PageJsonLd";
import { buildMetadata } from "@/lib/seo";
import { CONTACT_EMAIL } from "@/lib/site";
import { MODAL_BODY, MODAL_HEADING } from "@/data/copy";

const DESCRIPTION =
  "Tell us what needs to ship. A company site, a SaaS product, an ecommerce store, or a tool for the team. You see a working prototype first.";

export const dynamic = "force-dynamic";

export const metadata = buildMetadata({
  title: "Let's talk",
  description: DESCRIPTION,
  path: "/talk",
  keywords: ["contact", "brief", "Aevion Labs", "Let's talk"],
});

export default function TalkPage() {
  return (
    <main id="main" className="flex-1 bg-white">
      <PageJsonLd
        path="/talk"
        pageName="Let's talk"
        description={DESCRIPTION}
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Let's talk", path: "/talk" },
        ]}
      />

      <header className="mx-auto w-full max-w-[var(--section-max)] px-[var(--section-x)] pt-32 pb-12 sm:pt-36">
        <p className="site-kicker">Let&apos;s talk</p>
        <h1 className="site-display m-0 max-w-[16ch] text-[#111]">
          {MODAL_HEADING}
        </h1>
        <p className="site-body mt-6 m-0 max-w-[38rem]">{MODAL_BODY}</p>
        <p className="mt-8 m-0 max-w-[38rem] text-[0.98rem] font-normal leading-[1.55] text-[#3f3f3f]">
          Or write to{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-[#111] underline decoration-black/30 underline-offset-4"
          >
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </header>

      <div className="mx-auto w-full max-w-[var(--section-max)] px-[var(--section-x)] pb-[var(--section-y)]">
        <TalkForm />
      </div>
    </main>
  );
}
