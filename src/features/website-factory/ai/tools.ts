import type { PuckData, PuckNode, ProjectBundle, ThemeTokens } from "../types";
import { emptyPuck } from "../types";
import { COMPONENT_META } from "../puck/meta";

export type AiToolName =
  | "getWebsite"
  | "getPage"
  | "getBusiness"
  | "getTheme"
  | "listComponents"
  | "updateField"
  | "addComponent"
  | "removeComponent"
  | "moveComponent"
  | "duplicateComponent"
  | "createPage"
  | "updateTheme"
  | "updateSEO";

export type AiToolCall = {
  name: AiToolName;
  args: Record<string, unknown>;
};

export type AiPlan = {
  explanation: string;
  destructive: boolean;
  calls: AiToolCall[];
};

function nid() {
  return crypto.randomUUID();
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function planFromPrompt(prompt: string, bundle: ProjectBundle): AiPlan {
  const text = prompt.toLowerCase();
  const calls: AiToolCall[] = [];
  let explanation = "No structured change matched that request.";
  let destructive = false;

  if (/testimonial|review/.test(text) && /add/.test(text)) {
    explanation = "Add a testimonials section using existing reviews, after services if present.";
    calls.push({
      name: "addComponent",
      args: {
        type: "Testimonials",
        after: "Services",
        props: {
          heading: "Reviews",
          items: bundle.business.reviews.map((item) => ({
            quote: item.quote,
            name: item.customerName,
            rating: item.rating,
            source: item.source,
          })),
        },
      },
    });
  } else if (/hero/.test(text) && /minimal/.test(text)) {
    explanation = "Tighten the hero: drop the secondary action and keep the existing headline.";
    calls.push({
      name: "updateField",
      args: { type: "Hero", field: "secondaryLabel", value: "" },
    });
    calls.push({
      name: "updateField",
      args: { type: "Hero", field: "secondaryHref", value: "" },
    });
  } else if (/cta|button/.test(text) && /colour|color|primary/.test(text)) {
    explanation = "Set the theme accent to the primary brand colour.";
    calls.push({
      name: "updateTheme",
      args: { accent: bundle.project.theme.primary },
    });
  } else if (/about page/.test(text) && /create|add/.test(text)) {
    explanation = "Create an About page from the current business description.";
    calls.push({
      name: "createPage",
      args: { title: "About", slug: "about" },
    });
  } else if (/premium|more premium/.test(text)) {
    explanation = "Increase heading contrast and tighten radius. Copy is unchanged.";
    calls.push({
      name: "updateTheme",
      args: { radius: "0px", foreground: "#111111", background: "#f7f4ef" },
    });
  } else if (/nav|navigation/.test(text) && /mobile/.test(text)) {
    explanation = "Keep the header sticky so mobile navigation stays reachable.";
    calls.push({
      name: "updateField",
      args: { type: "Navbar", field: "sticky", value: "yes" },
    });
  }

  if (!calls.length) {
    explanation =
      "I can add a testimonial, tighten the hero, restyle CTAs, create an About page, or adjust theme tokens. Say which.";
  }
  if (calls.some((call) => call.name === "removeComponent")) destructive = true;
  return { explanation, destructive, calls };
}

export function applyToolCalls(
  bundle: ProjectBundle,
  pageData: PuckData,
  calls: AiToolCall[],
): { data: PuckData; theme?: ThemeTokens; seo?: ProjectBundle["project"]["seoConfig"]; pageTitle?: string } {
  let data = clone(pageData);
  let theme: ThemeTokens | undefined;
  let seo = bundle.project.seoConfig;
  let pageTitle: string | undefined;

  for (const call of calls) {
    if (call.name === "addComponent") {
      const type = String(call.args.type || "");
      if (!COMPONENT_META[type]) continue;
      const node: PuckNode = {
        type,
        props: { id: nid(), ...(call.args.props as Record<string, unknown> | undefined) },
      };
      const after = String(call.args.after || "");
      const index = after ? data.content.findIndex((item) => item.type === after) : -1;
      if (index >= 0) data.content.splice(index + 1, 0, node);
      else data.content.push(node);
    }
    if (call.name === "removeComponent") {
      const type = String(call.args.type || "");
      data.content = data.content.filter((item) => item.type !== type);
    }
    if (call.name === "moveComponent") {
      const type = String(call.args.type || "");
      const index = data.content.findIndex((item) => item.type === type);
      if (index > 0) {
        const [item] = data.content.splice(index, 1);
        data.content.splice(index - 1, 0, item);
      }
    }
    if (call.name === "duplicateComponent") {
      const type = String(call.args.type || "");
      const item = data.content.find((node) => node.type === type);
      if (item) {
        data.content.push({
          type: item.type,
          props: { ...item.props, id: nid() },
        });
      }
    }
    if (call.name === "updateField") {
      const type = String(call.args.type || "");
      const field = String(call.args.field || "");
      data.content = data.content.map((item) =>
        item.type === type
          ? { ...item, props: { ...item.props, [field]: call.args.value } }
          : item,
      );
    }
    if (call.name === "updateTheme") {
      theme = { ...bundle.project.theme, ...(call.args as Partial<ThemeTokens>) };
    }
    if (call.name === "updateSEO") {
      seo = { ...seo, ...(call.args as Partial<typeof seo>) };
    }
    if (call.name === "createPage") {
      pageTitle = String(call.args.title || "Page");
    }
  }
  return { data: data.content ? data : emptyPuck(), theme, seo, pageTitle };
}

export async function planWithOptionalModel(
  prompt: string,
  bundle: ProjectBundle,
): Promise<AiPlan> {
  const fallback = planFromPrompt(prompt, bundle);
  const key = process.env.AI_API_KEY?.trim();
  if (!key) return fallback;
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        authorization: `Bearer ${key}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.AI_MODEL || "gpt-4o-mini",
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You plan website edits for Aevion. Return JSON {explanation, destructive, calls:[{name, args}]}. Allowed names: addComponent, removeComponent, moveComponent, updateField, updateTheme, updateSEO, createPage. Do not invent business facts. Use existing reviews/services only.",
          },
          {
            role: "user",
            content: JSON.stringify({
              prompt,
              business: bundle.business.name,
              components: Object.keys(COMPONENT_META),
            }),
          },
        ],
      }),
    });
    if (!res.ok) return fallback;
    const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const parsed = JSON.parse(json.choices?.[0]?.message?.content || "{}") as AiPlan;
    if (!Array.isArray(parsed.calls)) return fallback;
    return {
      explanation: parsed.explanation || fallback.explanation,
      destructive: Boolean(parsed.destructive),
      calls: parsed.calls.filter((call) => typeof call?.name === "string"),
    };
  } catch {
    return fallback;
  }
}
