import { promises as fs } from "node:fs";
import path from "node:path";

import { z } from "zod";

export const THEME_FILE = path.join(process.cwd(), "content", "theme.json");

/**
 * Design tokens lifted out of the source site.
 *
 * Colours are an open record rather than a fixed list so a clone can add
 * tokens the shadcn base does not ship (`--brand-glow`, `--nav-scrolled`, …)
 * without editing this schema.
 */
export const ThemeSchema = z.object({
  /**
   * How the dark palette activates.
   *
   * - `class`  — only when `.dark` is on the root element. The default,
   *              because a clone should look like its source: auto-switching a
   *              light-only site to dark breaks the fidelity the clone exists
   *              for.
   * - `media`  — follows the visitor's OS setting. An explicit `.light` class
   *              still wins, so a toggle can override it later.
   * - `off`    — never; the dark tokens are kept but unused.
   *
   * Note that Tailwind's `dark:` utilities stay class-based regardless (see
   * `@custom-variant dark` in globals.css). Style through the tokens, which is
   * what every section component already does.
   */
  darkMode: z.enum(["class", "media", "off"]).default("class"),
  radius: z.string(),
  fonts: z.object({
    sans: z.string(),
    heading: z.string(),
    mono: z.string(),
  }),
  colors: z.object({
    light: z.record(z.string(), z.string()),
    dark: z.record(z.string(), z.string()),
  }),
});

export type Theme = z.infer<typeof ThemeSchema>;

function declarations(tokens: Record<string, string>): string {
  return Object.entries(tokens)
    .map(([name, value]) => `--${name}:${value};`)
    .join("");
}

/**
 * Render the theme as CSS.
 *
 * Selectors are `html:root` rather than `:root` so these declarations outrank
 * the defaults in `globals.css` no matter where the browser places this style
 * block, without resorting to `!important`.
 */
export function themeToCss(theme: Theme): string {
  const base = declarations({
    radius: theme.radius,
    "font-sans": theme.fonts.sans,
    "font-heading": theme.fonts.heading,
    "font-mono": theme.fonts.mono,
    ...theme.colors.light,
  });
  const light = `html:root{${base}}`;
  const dark = declarations(theme.colors.dark);
  const byClass = `html:root.dark{${dark}}`;

  if (theme.darkMode === "off") return light;

  if (theme.darkMode === "media") {
    // `:not(.light)` leaves room for an explicit light override to beat the OS
    // preference; the class rule follows so it still wins either way.
    return (
      `${light}@media (prefers-color-scheme: dark)` +
      `{html:root:not(.light){${dark}}}${byClass}`
    );
  }

  return `${light}${byClass}`;
}

export async function loadTheme(): Promise<Theme> {
  const raw = await fs.readFile(THEME_FILE, "utf8");
  const parsed = ThemeSchema.safeParse(JSON.parse(raw) as unknown);
  if (!parsed.success) {
    const detail = parsed.error.issues
      .map((issue) => `  · ${issue.path.join(".") || "(root)"} — ${issue.message}`)
      .join("\n");
    throw new Error(`content/theme.json is invalid:\n${detail}`);
  }
  return parsed.data;
}

export async function saveTheme(data: unknown): Promise<void> {
  const parsed = ThemeSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error("Invalid theme payload");
  }
  await fs.writeFile(THEME_FILE, `${JSON.stringify(parsed.data, null, 2)}\n`, "utf8");
}
