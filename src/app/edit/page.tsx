import Link from "next/link";
import { ArrowRight, Palette } from "lucide-react";

import { pages } from "@/content/registry";
import { readConfig } from "@/lib/content/store";

export default async function EditIndexPage() {
  const { variant } = await readConfig();

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Content</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Serving the <span className="font-medium text-foreground">{variant}</span> variant — change
        it in <code className="font-mono">content/config.json</code>.
      </p>

      <ul className="mt-8 space-y-3">
        {Object.values(pages).map((page) => (
          <li key={page.key}>
            <Link
              href={`/edit/${page.key}`}
              className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card px-5 py-4 transition-colors hover:border-primary/50"
            >
              <span className="min-w-0">
                <span className="block text-sm font-medium">{page.label}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  {page.description} · {page.route}
                </span>
              </span>
              <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
            </Link>
          </li>
        ))}
      </ul>

      <Link
        href="/edit/theme"
        className="mt-3 flex items-center justify-between gap-4 rounded-xl border border-border bg-card px-5 py-4 transition-colors hover:border-primary/50"
      >
        <span className="min-w-0">
          <span className="block text-sm font-medium">Theme</span>
          <span className="block truncate text-xs text-muted-foreground">
            Colours, radius, and font stacks · content/theme.json
          </span>
        </span>
        <Palette className="size-4 shrink-0 text-muted-foreground" />
      </Link>
    </main>
  );
}
