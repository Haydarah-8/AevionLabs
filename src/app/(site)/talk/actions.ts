"use server";

import { CONTACT_EMAIL } from "@/lib/site";

export type BriefState = {
  ok: boolean
  error?: string
  mailto?: string
};

function field(data: FormData, key: string) {
  const value = data.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function mailtoUrl(name: string, text: string) {
  const subject = encodeURIComponent(`Brief from ${name}`);
  const body = encodeURIComponent(text);
  return `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
}

export async function sendBrief(
  _prev: BriefState,
  formData: FormData,
): Promise<BriefState> {
  if (field(formData, "website")) return { ok: true };

  const name = field(formData, "name");
  const email = field(formData, "email");
  const company = field(formData, "company");
  const product = field(formData, "product");
  const budget = field(formData, "budget");
  const message = field(formData, "message");

  if (!name || name.length > 120) {
    return { ok: false, error: "Add your name." };
  }
  if (!email || email.length > 200 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Add a working email." };
  }
  if (!message || message.length < 12) {
    return { ok: false, error: "Tell us what needs to ship." };
  }
  if (message.length > 5000) {
    return { ok: false, error: "Keep the brief under 5000 characters." };
  }

  const lines = [`Name: ${name}`, `Email: ${email}`];
  if (company) lines.push(`Company: ${company}`);
  if (product) lines.push(`Product: ${product}`);
  if (budget) lines.push(`Budget: ${budget}`);
  lines.push("", message);
  const text = lines.join("\n");

  const key = process.env.RESEND_API_KEY;
  if (key) {
    const from =
      process.env.RESEND_FROM || "Aevion Labs <hello@theaevionlabs.com>";
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [CONTACT_EMAIL],
        reply_to: email,
        subject: `Brief from ${name}`,
        text,
      }),
    });
    if (!res.ok) {
      return {
        ok: false,
        error: "The form could not send just now. Email us from your mail app.",
        mailto: mailtoUrl(name, text),
      };
    }
    return { ok: true };
  }

  return { ok: true, mailto: mailtoUrl(name, text) };
}
