<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Cloneable — Website Clone → Editable Template

## What This Is
A template for reverse-engineering any website into a clean Next.js codebase **and turning it
into a customizable template**. The clone is the starting point, not the deliverable.

Three skills, run in order:

1. `/clone-website <url>` — pixel-perfect clone into Next.js components
2. `/templatize [page-key]` — lift every string, image, and link into a typed content layer
3. `/customize-site <brief>` — rebrand content + theme without touching a component

## Tech Stack
- **Framework:** Next.js 16 (App Router, React 19, TypeScript strict)
- **UI:** shadcn/ui (Tailwind CSS v4, `cn()` utility)
- **Content:** zod schemas + JSON files, validated at load
- **Icons:** Lucide React (replaced/supplemented by extracted SVGs during cloning)
- **Styling:** Tailwind CSS v4 with oklch design tokens, overridden from `content/theme.json`

## Commands
- `npm run dev` — Start dev server (the `/edit` editor is dev-only)
- `npm run build` — Production build
- `npm run lint` — ESLint check
- `npm run typecheck` — TypeScript check
- `npm run check` — Run lint + typecheck + build

## Code Style
- TypeScript strict mode, no `any`
- Named exports, PascalCase components, camelCase utils
- Tailwind utility classes, no inline styles
- 2-space indentation
- Responsive: mobile-first

## The Content Layer — Rules That Matter

This is what separates this template from a plain clone. Do not erode it.

- **Structure lives in components; content lives in JSON.** Layout, spacing, computed CSS, and
  interaction behavior stay in the component. Words, images, links, and repeat counts go in
  `content/<page>.json` and are described by a zod schema in `src/content/pages/<page>.ts`.
- **Every page is registered once** in `src/content/registry.ts`. Nothing else enumerates pages.
- **Schemas use the shared primitives** in `src/content/primitives.ts` (`text`, `longText`,
  `url`, `image`, `link`, `seo`). They carry the `ui` hints the editor renders controls from.
- **No `z.any()`, no numbered `card1`/`card2` fields.** Repeats are arrays; variants are enums.
- **Never hand-write a props interface that mirrors a schema.** Derive it: `Content["hero"]`.
- **Components must render at array length 0** — the editor lets people delete items.
- **`/edit` is development-only.** It writes to the repo, so it is guarded by
  `src/lib/content/guard.ts` and must never be exposed in a deployed build.
- **`*.placeholder.json` files are generated**, not hand-edited. Regenerate them from the editor.
- **Dark mode is opt-in per theme.** `content/theme.json` carries
  `darkMode: "class" | "media" | "off"`. A clone keeps the default `class`, so a light-only
  source never flips dark on a visitor whose OS is dark — that would break the fidelity the
  clone exists for. Use `media` only when the source itself follows the OS preference.
  Tailwind's `dark:` utilities stay class-based either way, so style through the tokens.

## Design Principles
- **Pixel-perfect emulation** — match the target's spacing, colors, typography exactly
- **Templatizing is a refactor** — the rendered pixels must not change; verify with before/after
  screenshots at 1440px and 390px
- **Real content during cloning** — actual text and assets from the target, not placeholders;
  neutral placeholders come later, from the generator
- **Beauty-first** — every pixel matters

## Project Structure
```
content/
  config.json       # Which variant is served: original | placeholder
  theme.json        # Colour tokens, radius, font stacks
  <page>.json       # Page content, validated by its schema
  <page>.placeholder.json  # Generated: source copy and imagery stripped
src/
  app/              # Next.js routes
    edit/           # Dev-only visual editor
    api/            # Dev-only content + theme write endpoints
  components/
    editor/         # Schema-driven form, theme editor
    sections/       # Page sections — take content as props
    ui/             # shadcn/ui primitives
    icons.tsx       # Icon name -> component map
  content/
    primitives.ts   # Shared schema field helpers
    pages/<page>.ts # One zod schema per page
    registry.ts     # Page registry (the only page list)
  lib/
    content/        # Loader, validation, placeholder generator
    theme/          # Theme schema + CSS variable rendering
public/
  images/           # Downloaded images from target site
  sites/            # Namespaced per-site/per-page assets
docs/
  research/         # Inspection output, component specs
  design-references/ # Screenshots
scripts/
  sync-agent-rules.sh  # Regenerate agent instruction files
  sync-skills.mjs      # Regenerate all skills for all platforms
```

## MOST IMPORTANT NOTES
- When launching Claude Code agent teams, ALWAYS have each teammate work in their own worktree
  branch and merge everyone's work at the end, resolving any merge conflicts smartly since you
  are basically serving the orchestrator role and have full context to our goals, work given,
  work achieved, and desired outcomes.
- **Do not templatize several pages in parallel in one worktree** — they all edit
  `src/content/registry.ts`. One at a time, or merge the registry last.
- After editing `AGENTS.md`, run `bash scripts/sync-agent-rules.sh` to regenerate
  platform-specific instruction files.
- After editing any `.claude/skills/*/SKILL.md`, run `node scripts/sync-skills.mjs` to
  regenerate that skill for all platforms.

@docs/research/INSPECTION_GUIDE.md
