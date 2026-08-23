import { z } from "zod";

import { image, link, longText, seo, text } from "@/content/primitives";

/**
 * Reference page schema.
 *
 * `/templatize` generates one file shaped exactly like this for every cloned
 * page: a section-per-key object, arrays wherever the source repeats a block,
 * and no free-form `Record<string, unknown>` escape hatches. Everything the
 * editor can change has to be described here.
 */

/** Icons the editor offers as a dropdown. Extend as sections need them. */
export const ICON_NAMES = [
  "sparkles",
  "gauge",
  "layers",
  "palette",
  "shield",
  "workflow",
  "wand",
  "code",
] as const;

export type IconName = (typeof ICON_NAMES)[number];

const icon = (title: string) =>
  z.enum(ICON_NAMES).meta({ title, ui: "select" });

export const HomeSchema = z.object({
  seo: seo(),

  nav: z
    .object({
      brand: text("Brand name"),
      links: z.array(link("Link")).meta({ title: "Navigation links" }),
      action: link("Header button"),
    })
    .meta({ title: "Navigation" }),

  hero: z
    .object({
      eyebrow: text("Eyebrow", "Small label above the headline"),
      title: text("Headline"),
      subtitle: longText("Subheadline"),
      primaryAction: link("Primary button"),
      secondaryAction: link("Secondary button"),
      image: image("Hero image"),
    })
    .meta({ title: "Hero" }),

  logos: z
    .object({
      caption: text("Caption"),
      items: z
        .array(z.object({ name: text("Name") }))
        .meta({ title: "Logos" }),
    })
    .meta({ title: "Logo cloud" }),

  features: z
    .object({
      eyebrow: text("Eyebrow"),
      title: text("Section title"),
      subtitle: longText("Section intro"),
      items: z
        .array(
          z.object({
            icon: icon("Icon"),
            title: text("Title"),
            body: longText("Body"),
          }),
        )
        .meta({ title: "Features" }),
    })
    .meta({ title: "Features" }),

  testimonials: z
    .object({
      title: text("Section title"),
      items: z
        .array(
          z.object({
            quote: longText("Quote"),
            name: text("Name"),
            role: text("Role"),
          }),
        )
        .meta({ title: "Testimonials" }),
    })
    .meta({ title: "Testimonials" }),

  cta: z
    .object({
      title: text("Headline"),
      subtitle: longText("Supporting copy"),
      action: link("Button"),
    })
    .meta({ title: "Call to action" }),

  footer: z
    .object({
      columns: z
        .array(
          z.object({
            heading: text("Column heading"),
            links: z.array(link("Link")).meta({ title: "Links" }),
          }),
        )
        .meta({ title: "Footer columns" }),
      legal: text("Legal line"),
    })
    .meta({ title: "Footer" }),
});

export type HomeContent = z.infer<typeof HomeSchema>;
