---
description: "Lift hard-coded copy out of components into a typed, editable content layer"
---
<!-- AUTO-GENERATED from .claude/skills/templatize/SKILL.md — do not edit directly.
     Run `node scripts/sync-skills.mjs` to regenerate. -->


# Templatize

You are converting the built page(s) **$ARGUMENTS** from hard-coded components into a
content-driven template. If no page key is given, templatize every page in
`src/content/registry.ts` that still has literals in its components, plus any page built by
`/clone-website` that is not yet registered.

**This is a refactor, not a redesign.** The rendered pixels before and after must be identical.
If the page looks different afterwards, you have changed something you were not asked to change.

## Why This Exists

A pixel-perfect clone whose copy lives inside JSX is a dead end: every text change is a code
change. Templatizing separates the two halves of a page:

- **Structure** — layout, spacing, computed CSS, interaction behavior, component boundaries.
  Stays in the components. Never becomes content.
- **Content** — the words, the pictures, the destinations, the repeat counts.
  Moves into `content/<page-key>.json`, described by a zod schema.

Once that boundary exists, `/customize-site` can rebrand the whole page without touching a
component, and a non-developer can edit it at `/edit`.

## Pre-Flight

1. Confirm the target page builds now: `npm run build`. Templatizing a broken page hides which
   change broke it.
2. Capture a **before** screenshot of the page at 1440px and 390px via browser MCP, saved under
   `docs/design-references/<site-key>/<page-key>/templatize-before-{desktop,mobile}.png`.
   These are the evidence for the visual-parity check at the end.
3. Read the existing reference implementation before writing anything:
   - `src/content/primitives.ts` — the field helpers you must reuse
   - `src/content/pages/home.ts` — the shape every page schema follows
   - `src/content/registry.ts` — where pages get registered
   - `src/lib/content/store.ts` — how content is loaded and validated
4. List every component file the page imports, transitively. That list is your work queue.

## Guiding Principles

### 1. Classify Every Literal Before You Move It

Walk each component and put every literal into exactly one bucket:

| Literal | Bucket | Goes where |
| --- | --- | --- |
| Visible text, alt text, aria-label text | Content | Schema field |
| `href` to any destination | Content | Schema field |
| Image/video `src` + intrinsic width/height | Content | Schema field |
| Repeated block (cards, nav items, columns) | Content | Array field |
| Tailwind classes, computed CSS values | Structure | Stays in the component |
| Breakpoints, grid column counts, z-index | Structure | Stays in the component |
| Which of N layout variants a section uses | Structure-ish | Enum field, only if the source genuinely varies it |
| Animation timings, easing, scroll thresholds | Structure | Stays in the component |

When you are unsure, ask: *would a client plausibly want to change this without a developer?*
Yes → content. No → structure.

### 2. Repeats Become Arrays, Never Numbered Fields

Three feature cards in the source is `items: z.array(...)` with three entries — not `card1`,
`card2`, `card3`. The editor renders arrays with add/remove/reorder controls, so an array is
what makes the template genuinely reusable. A numbered field is a clone with extra steps.

The component maps over the array. It must render correctly for **any** length, including zero,
because someone will delete an item in the editor.

### 3. No Escape Hatches In The Schema

`z.record(z.string(), z.unknown())`, `z.any()`, and a lone `z.string()` holding a blob of HTML
all defeat the purpose: the editor cannot render a control for them and validation cannot catch
a mistake. Every editable thing gets a named, typed field.

The one deliberate exception is `theme.colors`, which is an open record so a clone can add
tokens the shadcn base does not ship.

### 4. Variants Are Enums, So The Editor Can Offer A Dropdown

If a section has three visual states in the source, the field is
`z.enum(["a","b","c"])`, not a free string. Enums survive placeholder generation untouched and
render as a `<select>`. A free string there means someone types `centre` and the page breaks.

### 5. Verbatim Extraction

The JSON gets the *exact* text from the built component — same wording, same punctuation, same
casing. This step is a move, not a rewrite. Rewriting copy is `/customize-site`'s job, and
mixing the two makes the visual-parity check meaningless.

### 6. The Build Must Compile At Every Step

Templatize one page at a time and run `npx tsc --noEmit` after each component you rewire. A
half-migrated page where some props are threaded and some are not is the hardest state to debug.

## Phase 1: Write The Schema

Create `src/content/pages/<page-key>.ts`. Import the helpers from `@/content/primitives` —
`text`, `longText`, `url`, `image`, `link`, `seo` — rather than reaching for raw `z.string()`,
because those helpers carry the `ui` hints the editor renders from.

Shape it as one key per section, matching your `PAGE_TOPOLOGY.md` section names:

```ts
import { z } from "zod";

import { image, link, longText, seo, text } from "@/content/primitives";

export const PricingSchema = z.object({
  seo: seo(),
  hero: z
    .object({
      title: text("Headline"),
      subtitle: longText("Subheadline"),
      cta: link("Primary button"),
    })
    .meta({ title: "Hero" }),
  plans: z
    .object({
      title: text("Section title"),
      items: z
        .array(
          z.object({
            name: text("Plan name"),
            price: text("Price"),
            featured: z.boolean().meta({ title: "Highlight this plan" }),
            features: z.array(z.object({ label: text("Feature") })).meta({ title: "Features" }),
            cta: link("Button"),
          }),
        )
        .meta({ title: "Plans" }),
    })
    .meta({ title: "Pricing" }),
});

export type PricingContent = z.infer<typeof PricingSchema>;
```

Every `.meta({ title })` becomes the label in the editor. A section without one shows a
de-camelCased key, which is usually worse. Add `.meta({ description })` wherever a field's
purpose is not obvious from its label.

## Phase 2: Write The Content File

Create `content/<page-key>.json` by copying the literals out of the components verbatim.

- Image `src` values point at the already-downloaded namespaced assets under `public/sites/...`
- Image `width`/`height` are the intrinsic pixel dimensions — `next/image` requires them, and a
  wrong value shifts the layout
- Keep the key order the same as the schema so diffs stay readable

Validate as you go: the page will fail to build with the exact offending field path if the JSON
and schema disagree, which is the fastest way to find a typo.

## Phase 3: Rewire The Components

Each section component takes its slice of the content as a prop. Before:

```tsx
export function Hero() {
  return (
    <section className="px-6 py-24 text-center">
      <h1 className="text-5xl font-semibold tracking-tight">Ship faster with Acme</h1>
      <a href="/signup" className="mt-8 inline-flex rounded-lg bg-primary px-6 py-3">
        Start free
      </a>
    </section>
  );
}
```

After — note that every class name survived untouched:

```tsx
import type { PricingContent } from "@/content/pages/pricing";

export function Hero({ content }: { content: PricingContent["hero"] }) {
  return (
    <section className="px-6 py-24 text-center">
      <h1 className="text-5xl font-semibold tracking-tight">{content.title}</h1>
      <Link href={content.cta.href} className="mt-8 inline-flex rounded-lg bg-primary px-6 py-3">
        {content.cta.label}
      </Link>
    </section>
  );
}
```

Rules while rewiring:

- Type the prop as a slice of the page's content type (`Content["hero"]`), never re-declare the
  shape by hand — a hand-written interface is a second source of truth that will drift.
- Map over arrays; do not index into them (`items[0]`) — that crashes when the editor empties one.
- Keep every Tailwind class, wrapper element, and `key` strategy exactly as built.
- Icons become a name in an enum plus a lookup map, following `src/components/icons.tsx`.

Then wire the route to load content once and pass slices down, following `src/app/page.tsx`:

```tsx
const getContent = cache(() => loadContent("pricing"));

export async function generateMetadata(): Promise<Metadata> {
  const { seo } = await getContent();
  return { title: seo.title, description: seo.description };
}
```

## Phase 4: Register The Page

Add one entry to `src/content/registry.ts`. Nothing else in the app enumerates pages, so this is
the only place that can drift:

```ts
pricing: {
  key: "pricing",
  label: "Pricing",
  route: "/pricing",
  description: "Plan comparison",
  schema: PricingSchema,
},
```

## Phase 5: Generate The Placeholder Variant

With the dev server running, `POST /api/content/<page-key>/placeholder`, or click *Regenerate
placeholder variant* in the editor. This writes `content/<page-key>.placeholder.json` with the
source copy and imagery replaced by neutral stand-ins, while preserving enum values, numbers,
internal routes, and array lengths.

Publishing the placeholder variant means shipping the structure without the source site's words
and pictures. That matters when the clone was not of a site the user owns — say so plainly in
your completion report rather than deciding for them.

## Phase 6: Verify

Run all four. Report the result of each; do not summarize them as "works".

1. `npx tsc --noEmit` — no errors.
2. `npm run build` — passes, and the page still prerenders as static.
3. **Visual parity** — screenshot the page at 1440px and 390px and compare against the
   `templatize-before-*` captures from pre-flight. They must match. Any difference is a bug you
   introduced: a dropped class, a changed element, a wrong image dimension. Fix it before
   continuing.
4. **Editor loads** — open `/edit/<page-key>`, confirm every section appears, change one string,
   save, and confirm the preview updates and the JSON file on disk changed.

## Checklist

Before reporting completion:

- [ ] Schema file exists and uses the shared primitives
- [ ] Every visible string, `href`, and image in the page is a schema field
- [ ] Every repeated block is an array, and its component renders at length 0
- [ ] No `z.any()`, no `z.record` outside the theme, no numbered `card1`/`card2` fields
- [ ] Content JSON is verbatim from the built page
- [ ] Components keep every original class name
- [ ] Page registered in `src/content/registry.ts`
- [ ] Placeholder variant generated and schema-valid
- [ ] `tsc`, `build`, visual parity, and the editor all verified

## What NOT to Do

- **Don't rewrite copy while templatizing.** Verbatim now; `/customize-site` later. Mixing the
  two makes the visual-parity check unable to tell a refactor bug from an intentional edit.
- **Don't move CSS into content.** A `padding` field in JSON is how a template becomes a
  worse version of a stylesheet. Layout belongs in the component.
- **Don't collapse distinct sections into one generic `blocks` array.** It looks flexible and
  edits terribly, because every block needs every field.
- **Don't index into arrays.** `items[0].title` crashes the moment someone deletes an item.
- **Don't hand-write a props interface that duplicates the schema.** Derive it with
  `z.infer` and index into it.
- **Don't skip the before/after screenshots.** They are the only check that catches a dropped
  class, and a dropped class is the most common way this refactor goes wrong.
- **Don't templatize several pages in parallel in one worktree.** They share
  `src/content/registry.ts`, so concurrent edits conflict. One page at a time, or one worktree
  each with the registry merged last.

## Completion

Report:
- Page keys templatized, and the route each serves
- Schema file path and field count per page
- Content file path, plus whether a placeholder variant was generated
- Components rewired, and confirmation that no class names changed
- `tsc` / `build` results
- Visual parity result at 1440px and 390px, with the compared screenshot paths
- Editor smoke-test result
- Which content variant is currently active, and a plain statement of whether the user should
  publish `original` or `placeholder` given where the content came from
