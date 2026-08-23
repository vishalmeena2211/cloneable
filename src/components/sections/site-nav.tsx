import Link from "next/link";

import type { HomeContent } from "@/content/pages/home";

export function SiteNav({ content }: { content: HomeContent["nav"] }) {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-6 px-6">
        <Link href="/" className="text-base font-semibold tracking-tight">
          {content.brand}
        </Link>

        <ul className="hidden items-center gap-8 md:flex">
          {content.links.map((item) => (
            <li key={`${item.label}-${item.href}`}>
              <Link
                href={item.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <Link
          href={content.action.href}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          {content.action.label}
        </Link>
      </nav>
    </header>
  );
}
