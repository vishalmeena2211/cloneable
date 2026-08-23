# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2026-08-23

First release of Cloneable.

### Added

- **Content layer** — zod schemas in `src/content/pages/`, JSON content in `content/`, validated
  on load with field-path errors. Page registry in `src/content/registry.ts`.
- **Schema-driven editor** at `/edit` — form generated from JSON Schema with array
  add/remove/reorder, enum dropdowns, image previews, live page preview, and ⌘S to save.
  Development-only, guarded by `src/lib/content/guard.ts`.
- **Theme layer** — `content/theme.json` holds colour tokens, radius, and font stacks, rendered
  as CSS variables that override the shadcn defaults on specificity.
- **Placeholder variant generator** — walks schema and content together to strip source copy and
  imagery while preserving enums, numbers, internal routes, and array lengths. Exposed at
  `POST /api/content/<key>/placeholder` and from the editor.
- **`/templatize` skill** — converts built clone components into the content layer, verified by
  before/after screenshot parity.
- **`/customize-site` skill** — rebrands content and theme from a brief without touching
  components.
- Demo landing page, itself fully content-driven, so the editor works before any clone.

### Changed

- **`scripts/sync-skills.mjs`** now syncs every skill under `.claude/skills/` rather than one
  hard-coded skill, using `short-description` and `no-args-hint` frontmatter.
- **`/clone-website`** gained a Phase 6 hand-off to `/templatize` and reports whether it ran.
- **`AGENTS.md`** documents the content-layer rules that keep structure and content separate.

### Removed

- Upstream sponsor banners, funding config, star-history image, and the Japanese and Simplified
  Chinese READMEs, which described the upstream project.
