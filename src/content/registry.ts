import type { z } from "zod";

import { HomeSchema } from "@/content/pages/home";

export type PageDefinition<T extends z.ZodType = z.ZodType> = {
  /** Content filename stem: `content/<key>.json`. */
  key: string;
  /** Human label shown in the editor. */
  label: string;
  /** Route this content renders at. */
  route: string;
  /** One-line description shown in the editor index. */
  description: string;
  schema: T;
};

/**
 * Every content-driven page in the project.
 *
 * `/templatize` appends one entry per cloned page. Nothing else in the app
 * enumerates pages, so this is the single place that can drift.
 */
export const pages = {
  home: {
    key: "home",
    label: "Home",
    route: "/",
    description: "Landing page",
    schema: HomeSchema,
  },
} as const satisfies Record<string, PageDefinition>;

export type PageKey = keyof typeof pages;

export type PageContent<K extends PageKey> = z.infer<(typeof pages)[K]["schema"]>;

export const pageKeys = Object.keys(pages) as PageKey[];

export function isPageKey(value: string): value is PageKey {
  return Object.hasOwn(pages, value);
}
