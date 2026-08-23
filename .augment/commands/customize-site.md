---
description: "Rebrand a templatized site from a brief — content and theme only, never components"
argument-hint: "<brief>"
---
<!-- AUTO-GENERATED from .claude/skills/customize-site/SKILL.md — do not edit directly.
     Run `node scripts/sync-skills.mjs` to regenerate. -->


# Customize Site

You are rebranding this site for **$ARGUMENTS**.

**The invariant: you edit `content/*.json` and `content/theme.json`. You do not edit components.**

If fulfilling the brief seems to require a component change, that is a finding to report, not a
licence to edit. Either the schema is missing a field (say which), or the brief is asking for a
redesign rather than a rebrand (say so). Silently editing a component breaks the guarantee that
the same template can be rebranded again tomorrow.

## Pre-Flight

1. Read `src/content/registry.ts` for the list of pages.
2. For each page, read its schema in `src/content/pages/<key>.ts` and its current
   `content/<key>.json`. The schema tells you exactly which fields exist, which are enums, and
   how long the arrays may be. Work from it, not from what the rendered page looks like.
3. Read `content/theme.json` and `content/config.json`.
4. Confirm the site builds now: `npm run build`.
5. Screenshot the current page at 1440px via browser MCP as the before reference.

If the brief is thin — a company name and nothing else — ask for the few things that actually
change the output before writing anything: what the business does, who the customer is, the
tone, and whether they have brand colours or a logo. Then proceed.

## What You May Change

| Target | Change freely | Ask first |
| --- | --- | --- |
| Copy in content JSON | Yes | — |
| `href` values | Yes | — |
| Array lengths (add/remove cards, nav items, plans) | Yes | Removing a whole section's worth |
| Enum values (variants, icons) | Yes, within the enum | — |
| Colour tokens in `theme.json` | Yes | — |
| `radius`, font stacks | Yes | — |
| Image `src` | Only to assets that exist | Any new imagery |
| Component files, CSS files, schemas | No | Report instead |

## Content Rewriting

Rewrite every user-visible string for the new brand. Specifically:

- **Fit the shape.** A headline that was six words stays roughly six words. Copy that doubles in
  length reflows the layout the clone was built for and undoes the pixel work.
- **Rewrite, don't translate.** Do not map the old sentence word-for-word onto the new brand.
  Write what this business would actually say to its customer.
- **Keep the information architecture.** If the source had three features, the new brand gets
  three features — unless the brief gives you a reason to change the count, in which case change
  it deliberately and say so.
- **Fill every field.** A field left with the source brand's copy is the single most visible
  failure mode of a rebrand. Grep the finished JSON for the old brand name before you finish.
- **`seo.title` and `seo.description` count.** They are content too and are usually forgotten.
- **Alt text describes the new image**, not the old one.

## Theme Rewriting

Colours live as CSS custom properties in `content/theme.json`, in `light` and `dark` maps. The
existing tokens use `oklch(L C H)`, which makes a coherent palette straightforward: hold
lightness and chroma roughly constant, move the hue.

Rules that keep the result usable rather than merely different:

- **Change both maps.** Editing `light` and leaving `dark` as the old brand is a half-rebrand
  that shows up the moment someone's OS is in dark mode.
- **Foreground/background pairs must stay legible.** `primary-foreground` sits on `primary`,
  `muted-foreground` on `muted`, `card-foreground` on `card`. Aim for a contrast ratio of at
  least 4.5:1 for body text. When you set a vivid `primary`, its `primary-foreground` is almost
  always near-white or near-black — not a mid-tone of the same hue.
- **Keep `destructive` red-ish.** It is a signal colour, not a brand colour.
- **`border`, `input`, and `ring` are structural.** Tint them toward the brand hue at low chroma
  rather than making them vivid.
- **Dark-mode lightness inverts, chroma usually drops.** A `primary` of `oklch(0.54 0.21 265)`
  in light typically becomes something near `oklch(0.68 0.17 265)` in dark, so it stays
  readable against a dark surface.
- Font stacks may change, but loading a *new webfont* also needs `next/font` wiring in
  `src/app/layout.tsx` — a component change. Report it as a follow-up rather than editing.

## Imagery

You cannot invent the new brand's photography. For each image field:

- If a suitable asset already exists in `public/`, point at it and keep the intrinsic
  `width`/`height` accurate.
- If not, leave the field pointing at `/images/placeholder.png` and list it in your report as an
  asset the user must supply.
- **Never keep the source brand's logo, product screenshots, or distinctive artwork** in a
  rebrand. That is the one case where leaving the original is worse than leaving a placeholder.

## Applying The Changes

Write the JSON directly, or `PUT /api/content/<key>` while the dev server runs — either way the
schema validates the result, so a typo in an enum or a missing field fails loudly rather than
rendering a broken page.

Work one page at a time. After each page:

1. `npm run build` — must pass.
2. Screenshot at 1440px and 390px and compare against the before reference. The **layout**
   should be recognisably the same; the **words and colours** should be entirely new. If the
   layout shifted, your copy lengths are the likely cause.

## Checklist

- [ ] Every page in the registry rewritten, not just the home page
- [ ] Grep for the source brand name across `content/` returns nothing
- [ ] `seo.title` and `seo.description` rewritten on every page
- [ ] Alt text matches the images actually referenced
- [ ] Both `light` and `dark` colour maps updated
- [ ] Foreground/background pairs checked for contrast
- [ ] No component, CSS, or schema file modified — verify with `git status`
- [ ] `npm run build` passes
- [ ] Layout compared against the before screenshots at both widths

## What NOT to Do

- **Don't touch components.** If the brief needs one, report it. This is the whole point of the
  content layer.
- **Don't leave the old brand's name anywhere**, including nav labels, footers, alt text, and
  SEO fields.
- **Don't let copy grow unchecked.** The layout was built to specific text lengths.
- **Don't produce a palette by shifting hue alone and calling it done** — check that text still
  reads on every surface you changed.
- **Don't keep the source's logo or product imagery.** Placeholder plus a note beats
  appropriated brand assets.
- **Don't edit the `.placeholder.json` variants by hand.** They are generated; regenerate them
  from the editor after the content is final.

## Completion

Report:
- The brief as you understood it, including anything you inferred rather than were told
- Pages rewritten, with a one-line summary of the new positioning per page
- Theme changes: the old and new value for each token you altered, both modes
- Images left as placeholders that the user must supply
- Anything the brief asked for that would require a component or schema change, stated as a
  concrete follow-up
- `npm run build` result and the layout-comparison outcome
- Confirmation from `git status` that no component, CSS, or schema file was modified
