"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";

type Theme = {
  radius: string;
  fonts: { sans: string; heading: string; mono: string };
  colors: { light: Record<string, string>; dark: Record<string, string> };
};

type Mode = "light" | "dark";

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20";

function TokenRow({
  name,
  value,
  onChange,
  onRemove,
}: {
  name: string;
  value: string;
  onChange: (next: string) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        aria-hidden
        style={{ background: value }}
        className="size-8 shrink-0 rounded-md border border-border"
      />
      <label className="min-w-0 flex-1">
        <span className="sr-only">{name}</span>
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={cn(inputClass, "font-mono text-xs")}
        />
      </label>
      <code className="w-40 shrink-0 truncate text-xs text-muted-foreground">--{name}</code>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${name}`}
        className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
      >
        <Trash2 className="size-4" />
      </button>
    </div>
  );
}

export function ThemeEditor() {
  const [theme, setTheme] = useState<Theme | null>(null);
  const [saved, setSaved] = useState<string>("");
  const [mode, setMode] = useState<Mode>("light");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const response = await fetch("/api/theme");
      if (!response.ok) {
        setError("Could not load content/theme.json");
        return;
      }
      const body = (await response.json()) as Theme;
      setTheme(body);
      setSaved(JSON.stringify(body));
    })();
  }, []);

  if (error) return <p className="p-6 text-sm text-destructive">{error}</p>;
  if (!theme) {
    return (
      <p className="flex items-center gap-2 p-6 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Loading theme…
      </p>
    );
  }

  const dirty = JSON.stringify(theme) !== saved;

  const setToken = (name: string, value: string) =>
    setTheme({
      ...theme,
      colors: { ...theme.colors, [mode]: { ...theme.colors[mode], [name]: value } },
    });

  const removeToken = (name: string) => {
    const next = { ...theme.colors[mode] };
    delete next[name];
    setTheme({ ...theme, colors: { ...theme.colors, [mode]: next } });
  };

  const addToken = () => {
    const name = window.prompt("Token name (without the leading --)");
    if (!name) return;
    setToken(name.replace(/^--/, ""), "oklch(0.5 0 0)");
  };

  const save = async () => {
    setBusy(true);
    const response = await fetch("/api/theme", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(theme),
    });
    setBusy(false);
    if (!response.ok) {
      setError("Save failed — check the values are valid CSS colours.");
      return;
    }
    setSaved(JSON.stringify(theme));
    // The theme is read in the root layout, so a reload is the honest refresh.
    window.location.reload();
  };

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Theme</h1>
          <p className="mt-1 text-sm text-muted-foreground">content/theme.json</p>
        </div>
        <button
          type="button"
          onClick={() => void save()}
          disabled={!dirty || busy}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-opacity",
            dirty
              ? "bg-primary text-primary-foreground hover:opacity-90"
              : "bg-muted text-muted-foreground",
          )}
        >
          {busy ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
          {dirty ? "Save" : "Saved"}
        </button>
      </div>

      <section className="mt-8 space-y-4 rounded-xl border border-border bg-card p-5">
        <label className="block">
          <span className="text-xs font-medium text-muted-foreground">Corner radius</span>
          <input
            type="text"
            value={theme.radius}
            onChange={(event) => setTheme({ ...theme, radius: event.target.value })}
            className={cn(inputClass, "mt-1.5 font-mono text-xs")}
          />
        </label>

        {(["sans", "heading", "mono"] as const).map((slot) => (
          <label key={slot} className="block">
            <span className="text-xs font-medium text-muted-foreground capitalize">
              {slot} font stack
            </span>
            <input
              type="text"
              value={theme.fonts[slot]}
              onChange={(event) =>
                setTheme({ ...theme, fonts: { ...theme.fonts, [slot]: event.target.value } })
              }
              className={cn(inputClass, "mt-1.5 font-mono text-xs")}
            />
          </label>
        ))}

        <p className="text-xs text-muted-foreground">
          Font stacks set the CSS variables only. Loading a new webfont still means editing{" "}
          <code className="font-mono">src/app/layout.tsx</code>, which{" "}
          <code className="font-mono">next/font</code> reads at build time.
        </p>
      </section>

      <section className="mt-6 rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="inline-flex rounded-lg border border-border p-0.5">
            {(["light", "dark"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setMode(option)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors",
                  mode === option
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {option}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={addToken}
            className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
          >
            <Plus className="size-3.5" />
            Add token
          </button>
        </div>

        <div className="mt-5 space-y-2">
          {Object.entries(theme.colors[mode]).map(([name, value]) => (
            <TokenRow
              key={name}
              name={name}
              value={value}
              onChange={(next) => setToken(name, next)}
              onRemove={() => removeToken(name)}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
