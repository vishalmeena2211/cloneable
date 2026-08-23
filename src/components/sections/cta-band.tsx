import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { HomeContent } from "@/content/pages/home";

export function CtaBand({ content }: { content: HomeContent["cta"] }) {
  return (
    <section id="get-started" className="border-b border-border/60">
      <div className="mx-auto w-full max-w-6xl px-6 py-20 sm:py-24">
        <div className="rounded-2xl border border-border bg-card px-6 py-14 text-center sm:px-12">
          <h2 className="mx-auto max-w-2xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            {content.title}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-pretty text-muted-foreground">
            {content.subtitle}
          </p>
          <Link
            href={content.action.href}
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            {content.action.label}
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
