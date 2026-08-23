#!/usr/bin/env node

/**
 * Generates command/skill files for every supported AI coding platform.
 *
 * Source of truth: .claude/skills/<name>/SKILL.md — every skill in that
 * directory is synced, so adding a skill needs no change to this script.
 *
 * Usage: node scripts/sync-skills.mjs
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SKILLS_DIR = join(ROOT, '.claude', 'skills');

// --- Discover skills ---

if (!existsSync(SKILLS_DIR)) {
  console.error('Error: no .claude/skills directory found');
  process.exit(1);
}

// Sorted so regenerating always produces byte-identical output (CI diffs on this).
const skillNames = readdirSync(SKILLS_DIR, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .filter((name) => existsSync(join(SKILLS_DIR, name, 'SKILL.md')))
  .sort();

if (skillNames.length === 0) {
  console.error('Error: no SKILL.md files found under .claude/skills/');
  process.exit(1);
}

// --- Helpers ---

function write(relPath, content) {
  const full = join(ROOT, relPath);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, content, 'utf8');
  console.log(`  ✓ ${relPath}`);
}

/** Read one scalar key out of a YAML frontmatter block. */
function frontmatterValue(frontmatter, key) {
  const match = frontmatter.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'));
  if (!match) return null;
  return match[1].trim().replace(/^["'](.*)["']$/, '$1');
}

function parseSkill(name) {
  const source = join(SKILLS_DIR, name, 'SKILL.md');
  const raw = readFileSync(source, 'utf8').replace(/\r\n/g, '\n');
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    console.error(`Error: could not parse frontmatter in .claude/skills/${name}/SKILL.md`);
    process.exit(1);
  }

  const [, frontmatter, body] = match;
  const shortDesc =
    frontmatterValue(frontmatter, 'short-description') ??
    frontmatterValue(frontmatter, 'description') ??
    name;

  return {
    name,
    raw,
    body,
    shortDesc,
    argumentHint: frontmatterValue(frontmatter, 'argument-hint'),
    noArgsHint:
      frontmatterValue(frontmatter, 'no-args-hint') ?? 'the arguments provided by the user',
  };
}

const header = (name) =>
  `<!-- AUTO-GENERATED from .claude/skills/${name}/SKILL.md — do not edit directly.\n` +
  '     Run `node scripts/sync-skills.mjs` to regenerate. -->\n\n';

/** YAML/TOML-safe: these strings are emitted inside double quotes. */
const quote = (value) => value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');

const hintLine = (skill) =>
  skill.argumentHint ? `argument-hint: "${quote(skill.argumentHint)}"\n` : '';

// --- Generate ---

console.log('Syncing skills to all platforms...');
console.log(`  Skills: ${skillNames.join(', ')}\n`);

let fileCount = 0;
const countingWrite = (relPath, content) => {
  write(relPath, content);
  fileCount += 1;
};

for (const name of skillNames) {
  const skill = parseSkill(name);
  const { body, raw, shortDesc } = skill;
  const noArgs = (text) => text.replace(/\$ARGUMENTS/g, skill.noArgsHint);
  const agentSkill = (text) =>
    `---\nname: ${name}\ndescription: "${quote(shortDesc)}"\n---\n${noArgs(text)}`;

  console.log(`  ${name}:`);

  // 1. Codex CLI — same SKILL.md format, same $ARGUMENTS syntax
  countingWrite(`.codex/skills/${name}/SKILL.md`, raw);

  // 2. GitHub Copilot — same SKILL.md format
  countingWrite(`.github/skills/${name}/SKILL.md`, raw);

  // 3. Kiro — same SKILL.md format and $ARGUMENTS syntax
  countingWrite(`.kiro/skills/${name}/SKILL.md`, raw);

  // 4. Cline — Agent Skills format without Claude-only frontmatter/placeholders
  countingWrite(`.cline/skills/${name}/SKILL.md`, agentSkill(body));

  // 5. Roo Code — standards-compliant Agent Skill plus a slash-command entry point
  countingWrite(`.roo/skills/${name}/SKILL.md`, agentSkill(body));
  countingWrite(
    `.roo/commands/${name}.md`,
    `---\ndescription: "${quote(shortDesc)}"\n${hintLine(skill)}---\n` +
      header(name) +
      `Use the \`${name}\` skill for ${skill.noArgsHint}. ` +
      'Load that skill and follow its workflow exactly.\n',
  );

  // 6. Cursor — plain markdown, no argument substitution support
  countingWrite(`.cursor/commands/${name}.md`, header(name) + noArgs(body));

  // 7. Windsurf — markdown workflow
  countingWrite(`.windsurf/workflows/${name}.md`, header(name) + noArgs(body));

  // 8. Gemini CLI — TOML format, {{args}} for arguments
  countingWrite(
    `.gemini/commands/${name}.toml`,
    `# AUTO-GENERATED from .claude/skills/${name}/SKILL.md\n` +
      `# Run \`node scripts/sync-skills.mjs\` to regenerate.\n\n` +
      `description = "${quote(shortDesc)}"\n` +
      `name = "${name}"\n\n` +
      `prompt = '''\n${body.replace(/\$ARGUMENTS/g, '{{args}}')}\n'''\n`,
  );

  // 9. OpenCode — markdown + YAML frontmatter, $ARGUMENTS works natively
  countingWrite(
    `.opencode/commands/${name}.md`,
    `---\ndescription: "${quote(shortDesc)}"\n---\n${header(name)}${body}`,
  );

  // 10. Augment Code — markdown + YAML frontmatter
  countingWrite(
    `.augment/commands/${name}.md`,
    `---\ndescription: "${quote(shortDesc)}"\n${hintLine(skill)}---\n${header(name)}${body}`,
  );

  // 11. Continue — prompt file with invokable: true
  countingWrite(
    `.continue/commands/${name}.md`,
    `---\nname: ${name}\ndescription: "${quote(shortDesc)}"\ninvokable: true\n---\n${header(name)}${body}`,
  );

  // 12. Amazon Q — JSON agent definition
  countingWrite(
    `.amazonq/cli-agents/${name}.json`,
    `${JSON.stringify(
      {
        name,
        description: shortDesc,
        prompt: noArgs(body),
        fileContext: ['AGENTS.md', 'docs/research/**'],
      },
      null,
      2,
    )}\n`,
  );

  console.log('');
}

console.log(
  `Done! ${fileCount} platform command/skill files generated from ${skillNames.length} source skills.`,
);
