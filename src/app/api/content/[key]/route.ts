import { z } from "zod";

import { pages } from "@/content/registry";
import { EDITOR_ENABLED, editorDisabledResponse } from "@/lib/content/guard";
import { isPageKey, loadContent, resolveContentFile, saveContent } from "@/lib/content/store";

type Params = { params: Promise<{ key: string }> };

export async function GET(_request: Request, { params }: Params) {
  if (!EDITOR_ENABLED) return editorDisabledResponse();
  const { key } = await params;
  if (!isPageKey(key)) return Response.json({ error: `Unknown page "${key}"` }, { status: 404 });

  const [{ variant, fellBack }, data] = await Promise.all([
    resolveContentFile(key),
    loadContent(key),
  ]);

  return Response.json({
    key,
    label: pages[key].label,
    route: pages[key].route,
    variant,
    fellBack,
    schema: z.toJSONSchema(pages[key].schema),
    data,
  });
}

export async function PUT(request: Request, { params }: Params) {
  if (!EDITOR_ENABLED) return editorDisabledResponse();
  const { key } = await params;
  if (!isPageKey(key)) return Response.json({ error: `Unknown page "${key}"` }, { status: 404 });

  try {
    await saveContent(key, await request.json());
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Could not save content" },
      { status: 400 },
    );
  }
  return Response.json({ ok: true });
}
