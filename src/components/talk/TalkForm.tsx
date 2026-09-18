"use client";

import { useActionState } from "react";
import { sendBrief, type BriefState } from "@/app/(site)/talk/actions";
import { CONTACT_EMAIL } from "@/lib/site";

const INITIAL: BriefState = { ok: false };

const PRODUCTS = [
  "Company site",
  "SaaS product",
  "Ecommerce",
  "Tool for the team",
  "Design system",
  "Not sure yet",
];

const fieldClass =
  "mt-3 w-full border-0 bg-transparent p-0 text-[1.15rem] font-normal leading-[1.4] tracking-[-0.02em] text-[#111] outline-none placeholder:text-[#b0b0b0]";

export function TalkForm() {
  const [state, action, pending] = useActionState(sendBrief, INITIAL);

  if (state.ok && !state.mailto) {
    return (
      <div className="border-t border-black/15 pt-12">
        <p className="site-kicker">Sent</p>
        <h2 className="site-display m-0 max-w-[14ch] text-[#111]">
          We have the brief.
        </h2>
        <p className="site-body mt-6 m-0 max-w-[38rem]">
          We read every enquiry ourselves and reply with honest next steps, even
          when we are not the right fit.
        </p>
      </div>
    );
  }

  if (state.ok && state.mailto) {
    return (
      <div className="border-t border-black/15 pt-12">
        <p className="site-kicker">One more step</p>
        <h2 className="site-display m-0 max-w-[16ch] text-[#111]">
          Send it from your mail app.
        </h2>
        <p className="site-body mt-6 m-0 max-w-[38rem]">
          The brief is ready. Open your email to send it to {CONTACT_EMAIL}.
        </p>
        <a
          href={state.mailto}
          className="mt-10 inline-block text-[1.05rem] text-[#111] underline decoration-black/30 underline-offset-4"
        >
          Open email →
        </a>
      </div>
    );
  }

  return (
    <form action={action}>
      <p className="hidden" aria-hidden="true">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </p>

      <label className="block border-t border-black/15 py-8">
        <span className="text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-[#6a6a6a]">
          Name
        </span>
        <input
          required
          name="name"
          autoComplete="name"
          className={fieldClass}
          placeholder="Your name"
        />
      </label>

      <label className="block border-t border-black/15 py-8">
        <span className="text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-[#6a6a6a]">
          Email
        </span>
        <input
          required
          type="email"
          name="email"
          autoComplete="email"
          className={fieldClass}
          placeholder="you@company.com"
        />
      </label>

      <label className="block border-t border-black/15 py-8">
        <span className="text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-[#6a6a6a]">
          Company
        </span>
        <input
          name="company"
          autoComplete="organization"
          className={fieldClass}
          placeholder="Optional"
        />
      </label>

      <label className="block border-t border-black/15 py-8">
        <span className="text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-[#6a6a6a]">
          What it is
        </span>
        <select
          name="product"
          defaultValue=""
          className={`${fieldClass} cursor-pointer appearance-none`}
        >
          <option value="">Optional</option>
          {PRODUCTS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>

      <label className="block border-t border-black/15 py-8">
        <span className="text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-[#6a6a6a]">
          Budget
        </span>
        <input
          name="budget"
          className={fieldClass}
          placeholder="Optional. Tell us the budget you have."
        />
      </label>

      <label className="block border-t border-black/15 py-8">
        <span className="text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-[#6a6a6a]">
          What needs to ship
        </span>
        <textarea
          required
          name="message"
          rows={6}
          className={`${fieldClass} resize-y`}
          placeholder="The product, the stall, and when it has to be live."
        />
      </label>

      {state.error ? (
        <p className="m-0 border-t border-black/15 py-6 text-[0.98rem] text-[#111]">
          {state.error}
          {state.mailto ? (
            <>
              {" "}
              <a
                href={state.mailto}
                className="underline decoration-black/30 underline-offset-4"
              >
                Open email
              </a>
            </>
          ) : null}
        </p>
      ) : null}

      <div className="border-t border-black/15 py-10">
        <button
          type="submit"
          disabled={pending}
          className="border-0 bg-transparent p-0 text-[1.05rem] text-[#111] underline decoration-black/30 underline-offset-4 disabled:opacity-40"
        >
          {pending ? "Sending…" : "Send the brief →"}
        </button>
      </div>
    </form>
  );
}
