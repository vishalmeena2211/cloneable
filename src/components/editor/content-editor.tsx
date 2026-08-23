"use client";

import { useCallback, useEffect, useState } from "react";
import { ExternalLink, Loader2, RefreshCw, Save } from "lucide-react";

import { SchemaForm } from "@/components/editor/schema-form";
import type { JsonSchema } from "@/lib/content/json-schema";
import { cn } from "@/lib/utils";

type Payload = {
  key: string;
  label: string;
  route: string;
  variant: "original" | "placeholder";
  fellBack: boolean;
  schema: JsonSchema;
  data: unknown;
};

type Status = { kind: "idle" | "saving" | "saved" | "error"; message?: string };

export function ContentEditor({ pageKey }: { pageKey: string }) {
  const [payload, setPayload] = useState<Payload | null>(null);
  const [draft, setDraft] = useState<unknown>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [previewNonce, setPreviewNonce] = useState(0);

  useEffect(() => {
    let active = true;
    void (async () => {
      const response = await fetch(`/api/content/${pageKey}`);
      const body = (await response.json()) as Payload & { error?: string };
      if (!active) return;
      if (!response.ok) {
        setStatus({ kind: "error", message: body.error ?? "Could not load content" });
        return;
      }
      setPayload(body);
      setDraft(body.data);
    })();
    return () => {
      active = false;
    };
  }, [pageKey]);

  const dirty = payload !== null && JSON.stringify(draft) !== JSON.stringify(payload.data);

  const save = useCallback(async () => {
    if (!payload || !dirty) return;
    setStatus({ kind: "saving" });
    const response = await fetch(`/api/content/${pageKey}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(draft),
    });
    const body = (await response.json()) as { error?: string };
    if (!response.ok) {
      setStatus({ kind: "error", message: body.error ?? "Save failed" });
      return;
    }
    setPayload({ ...payload, data: draft });
    setStatus({ kind: "saved" });
    setPreviewNonce((value) => value + 1);
  }, [dirty, draft, pageKey, payload]);

  // Cmd/Ctrl+S saves, matching the muscle memory of editing the JSON by hand.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        void save();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [save]);

  const generatePlaceholder = async () => {
    setStatus({ kind: "saving" });
    const response = await fetch(`/api/content/${pageKey}/placeholder`, { method: "POST" });
    const body = (await response.json()) as { error?: string; file?: string };
    setStatus(
      response.ok
        ? { kind: "saved", message: `Wrote ${body.file}` }
        : { kind: "error", message: body.error ?? "Could not generate placeholder" },
    );
  };

  if (status.kind === "error" && !payload) {
    return <p className="p-6 text-sm text-destructive">{status.message}</p>;
  }

  if (!payload) {
    return (
      <p className="flex items-center gap-2 p-6 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Loading content…
      </p>
    );
  }

  return (
    <div className="grid flex-1 grid-cols-1 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
      <section className="flex max-h-[calc(100vh-4rem)] flex-col border-r border-border">
        <header className="flex items-center justify-between gap-3 border-b border-border px-5 py-3">
          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold">{payload.label}</h1>
            <p className="truncate text-xs text-muted-foreground">
              content/{payload.key}
              {payload.variant === "placeholder" ? ".placeholder" : ""}.json
            </p>
          </div>
          <button
            type="button"
            onClick={() => void save()}
            disabled={!dirty || status.kind === "saving"}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-opacity",
              dirty
                ? "bg-primary text-primary-foreground hover:opacity-90"
                : "bg-muted text-muted-foreground",
            )}
          >
            {status.kind === "saving" ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Save className="size-3.5" />
            )}
            {dirty ? "Save" : "Saved"}
          </button>
        </header>

        {payload.fellBack ? (
          <p className="border-b border-border bg-muted/50 px-5 py-2 text-xs text-muted-foreground">
            No placeholder variant yet — editing the original.
          </p>
        ) : null}

        {status.message ? (
          <p
            className={cn(
              "border-b border-border px-5 py-2 text-xs",
              status.kind === "error" ? "text-destructive" : "text-muted-foreground",
            )}
          >
            {status.message}
          </p>
        ) : null}

        <div className="flex-1 overflow-y-auto p-5">
          <SchemaForm schema={payload.schema} value={draft} onChange={setDraft} />

          <button
            type="button"
            onClick={() => void generatePlaceholder()}
            className="mt-6 w-full rounded-lg border border-dashed border-border px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
          >
            Regenerate placeholder variant from this content
          </button>
        </div>
      </section>

      <section className="hidden flex-col bg-muted/30 lg:flex">
        <header className="flex items-center justify-between gap-3 border-b border-border px-5 py-3">
          <span className="text-xs font-medium text-muted-foreground">
            Preview · {payload.route}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPreviewNonce((value) => value + 1)}
              aria-label="Reload preview"
              className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted"
            >
              <RefreshCw className="size-3.5" />
            </button>
            <a
              href={payload.route}
              target="_blank"
              rel="noreferrer"
              aria-label="Open page in a new tab"
              className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted"
            >
              <ExternalLink className="size-3.5" />
            </a>
          </div>
        </header>
        <iframe
          key={previewNonce}
          src={payload.route}
          title={`${payload.label} preview`}
          className="h-[calc(100vh-7rem)] w-full bg-background"
        />
      </section>
    </div>
  );
}
