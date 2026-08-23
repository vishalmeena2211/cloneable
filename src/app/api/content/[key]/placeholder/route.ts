import { promises as fs } from "node:fs";

import { z } from "zod";

import { pages } from "@/content/registry";
import { EDITOR_ENABLED, editorDisabledResponse } from "@/lib/content/guard";
import { makePlaceholder } from "@/lib/content/placeholder";
import { contentFile, isPageKey, loadContent } from "@/lib/content/store";

type Params = { params: Promise<{ key: string }> };

/** Regenerate `content/<key>.placeholder.json` from the original content. */
export async function POST(_request: Request, { params }: Params) {
  if (!EDITOR_ENABLED) return editorDisabledResponse();
  const { key } = await params;
  if (!isPageKey(key)) return Response.json({ error: `Unknown page "${key}"` }, { status: 404 });

  const original = await loadContent(key, "original");
  const schema = z.toJSONSchema(pages[key].schema);
  const stripped = makePlaceholder(schema, original);

  const parsed = pages[key].schema.safeParse(stripped);
  if (!parsed.success) {
    return Response.json(
      { error: "Generated placeholder failed schema validation" },
      { status: 500 },
    );
  }

  const file = contentFile(key, "placeholder");
  await fs.writeFile(file, `${JSON.stringify(parsed.data, null, 2)}\n`, "utf8");
  return Response.json({ ok: true, file: file.split("/").slice(-2).join("/") });
}
