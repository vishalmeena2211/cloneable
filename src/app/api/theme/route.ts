import { EDITOR_ENABLED, editorDisabledResponse } from "@/lib/content/guard";
import { loadTheme, saveTheme } from "@/lib/theme/theme";

export async function GET() {
  if (!EDITOR_ENABLED) return editorDisabledResponse();
  return Response.json(await loadTheme());
}

export async function PUT(request: Request) {
  if (!EDITOR_ENABLED) return editorDisabledResponse();
  try {
    await saveTheme(await request.json());
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Could not save theme" },
      { status: 400 },
    );
  }
  return Response.json({ ok: true });
}
