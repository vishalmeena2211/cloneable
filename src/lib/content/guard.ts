/**
 * The editor writes to files in the repo, so it is a development tool only.
 * A deployed build must never expose these endpoints — a hosted instance has
 * no writable source tree, and an unauthenticated content-write endpoint is a
 * defacement vector.
 */
export const EDITOR_ENABLED = process.env.NODE_ENV !== "production";

export function editorDisabledResponse(): Response {
  return Response.json(
    {
      error:
        "The Reforge editor is available in development only. Run `npm run dev` and open /edit.",
    },
    { status: 403 },
  );
}
