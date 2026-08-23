/**
 * Schema-aware content stripper.
 *
 * Walks a JSON Schema and a content object together, replacing free-text and
 * imagery with neutral stand-ins while preserving everything that carries
 * structure: enum members, numbers, booleans, internal routes, and array
 * lengths. Working from the schema (rather than guessing from key names alone)
 * is what keeps `icon: "layers"` intact instead of turning it into prose and
 * breaking validation.
 */

import { asSchema } from "@/lib/content/json-schema";

export const PLACEHOLDER_IMAGE = "/images/placeholder.png";

/** Neutral copy keyed by the kind of field, not by the source wording. */
const COPY: Record<string, string> = {
  title: "Your headline goes here",
  heading: "Section heading",
  subtitle: "One sentence explaining what this section is for.",
  body: "Describe this item in a sentence or two. Replace with your own copy.",
  quote: "A short customer quote goes here, in their own words.",
  description: "A concise description of this page for search engines.",
  name: "Name",
  role: "Job title, Company",
  label: "Link text",
  brand: "Your Brand",
  eyebrow: "Eyebrow",
  caption: "Caption text",
  alt: "Placeholder image",
  legal: "© Your Company. All rights reserved.",
};

const DEFAULT_COPY = "Replace this text with your own.";

/** Pick neutral copy for a field, then loosely match the original's length. */
function placeholderText(key: string, original: string): string {
  const lower = key.toLowerCase();
  const matched =
    COPY[lower] ??
    Object.entries(COPY).find(([hint]) => lower.includes(hint))?.[1] ??
    DEFAULT_COPY;

  // Long source strings get padded so the layout keeps roughly its shape.
  if (original.length <= matched.length * 1.6) return matched;
  const filler = " Replace this text with your own.";
  let out = matched;
  while (out.length < original.length * 0.8) out += filler;
  return out;
}

function placeholderHref(original: string): string {
  // Internal routes and in-page anchors are structure; external URLs are not.
  return original.startsWith("/") || original.startsWith("#") ? original : "#";
}

export function makePlaceholder(input: unknown, data: unknown, key = ""): unknown {
  const schema = asSchema(input);
  if (schema.enum) return data;

  if (schema.type === "object" && schema.properties) {
    const source = (data ?? {}) as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const [name, child] of Object.entries(schema.properties)) {
      out[name] = makePlaceholder(child, source[name], name);
    }
    return out;
  }

  if (schema.type === "array" && schema.items) {
    const items = Array.isArray(data) ? data : [];
    return items.map((item) => makePlaceholder(schema.items, item, key));
  }

  if (schema.type === "string") {
    const original = typeof data === "string" ? data : "";
    if (schema.ui === "image" || key === "src") return PLACEHOLDER_IMAGE;
    if (schema.ui === "url" || key === "href") return placeholderHref(original);
    return placeholderText(key, original);
  }

  // Numbers and booleans are layout-bearing (image dimensions, toggles).
  return data;
}
