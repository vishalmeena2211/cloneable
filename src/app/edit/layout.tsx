import type { Metadata } from "next";
import Link from "next/link";

import { EDITOR_ENABLED } from "@/lib/content/guard";

export const metadata: Metadata = {
  title: "Reforge editor",
  robots: { index: false, follow: false },
};

export default function EditLayout({ children }: { children: React.ReactNode }) {
  if (!EDITOR_ENABLED) {
    return (
      <main className="mx-auto flex max-w-md flex-1 flex-col justify-center px-6 py-20 text-center">
        <h1 className="text-lg font-semibold">Editor unavailable</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          The editor writes to files in the repository, so it runs in development only. Start it
          with <code className="font-mono text-foreground">npm run dev</code> and open{" "}
          <code className="font-mono text-foreground">/edit</code>.
        </p>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-16 shrink-0 items-center gap-6 border-b border-border px-6">
        <Link href="/edit" className="text-sm font-semibold tracking-tight">
          Reforge editor
        </Link>
        <nav className="flex items-center gap-4 text-sm text-muted-foreground">
          <Link href="/edit" className="transition-colors hover:text-foreground">
            Content
          </Link>
          <Link href="/edit/theme" className="transition-colors hover:text-foreground">
            Theme
          </Link>
          <Link href="/" className="transition-colors hover:text-foreground">
            View site
          </Link>
        </nav>
      </header>
      {children}
    </div>
  );
}
