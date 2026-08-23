import { z } from "zod";

/**
 * Field-level hints consumed by the schema-driven editor at `/edit`.
 * They travel with the schema into JSON Schema via `.meta()`, so the editor
 * never needs a second, hand-maintained description of the same fields.
 */
export type UiHint =
  | "text"
  | "textarea"
  | "url"
  | "image"
  | "color"
  | "select";

/** Single-line string. */
export const text = (title: string, help?: string) =>
  z.string().meta({ title, description: help, ui: "text" satisfies UiHint });

/** Multi-line string — rendered as a textarea. */
export const longText = (title: string, help?: string) =>
  z.string().meta({ title, description: help, ui: "textarea" satisfies UiHint });

/** URL or route. Accepts relative paths, so it is not `z.url()`. */
export const url = (title: string, help?: string) =>
  z.string().meta({ title, description: help, ui: "url" satisfies UiHint });

/** Image with the intrinsic dimensions `next/image` requires. */
export const image = (title: string, help?: string) =>
  z
    .object({
      src: z
        .string()
        .meta({ title: "File", ui: "image" satisfies UiHint }),
      alt: z.string().meta({ title: "Alt text" }),
      width: z.number().int().positive().meta({ title: "Width (px)" }),
      height: z.number().int().positive().meta({ title: "Height (px)" }),
    })
    .meta({ title, description: help });

/** Labelled hyperlink. */
export const link = (title: string, help?: string) =>
  z
    .object({
      label: z.string().meta({ title: "Label" }),
      href: z.string().meta({ title: "URL", ui: "url" satisfies UiHint }),
    })
    .meta({ title, description: help });

/** Per-page metadata mapped onto the Next.js `Metadata` export. */
export const seo = () =>
  z
    .object({
      title: text("Browser title"),
      description: longText("Meta description"),
    })
    .meta({ title: "SEO" });

export type ImageContent = z.infer<ReturnType<typeof image>>;
export type LinkContent = z.infer<ReturnType<typeof link>>;
