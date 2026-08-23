import Link from "next/link";

import type { HomeContent } from "@/content/pages/home";

export function SiteFooter({ content }: { content: HomeContent["footer"] }) {
  return (
    <footer className="mt-auto">
      <div className="mx-auto w-full max-w-6xl px-6 py-14">
        <div className="grid gap-10 sm:grid-cols-3">
          {content.columns.map((column) => (
            <div key={column.heading}>
              <h3 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                {column.heading}
              </h3>
              <ul className="mt-4 space-y-3">
                {column.links.map((item) => (
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
            </div>
          ))}
        </div>

        <p className="mt-12 border-t border-border pt-6 text-xs text-muted-foreground">
          {content.legal}
        </p>
      </div>
    </footer>
  );
}
