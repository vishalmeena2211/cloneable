import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { HomeContent } from "@/content/pages/home";

export function Hero({ content }: { content: HomeContent["hero"] }) {
  return (
    <section className="relative overflow-hidden border-b border-border/60">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-40 h-80 bg-primary/15 blur-3xl"
      />

      <div className="relative mx-auto w-full max-w-6xl px-6 pt-20 pb-16 text-center sm:pt-28">
        <span className="inline-flex items-center rounded-full border border-border bg-muted/60 px-3 py-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {content.eyebrow}
        </span>

        <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl md:text-6xl">
          {content.title}
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base text-pretty text-muted-foreground sm:text-lg">
          {content.subtitle}
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href={content.primaryAction.href}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 sm:w-auto"
          >
            {content.primaryAction.label}
            <ArrowRight className="size-4" />
          </Link>
          <Link
            href={content.secondaryAction.href}
            className="inline-flex w-full items-center justify-center rounded-lg border border-border px-6 py-3 text-sm font-medium transition-colors hover:bg-muted sm:w-auto"
          >
            {content.secondaryAction.label}
          </Link>
        </div>

        <div className="mt-16 overflow-hidden rounded-xl border border-border shadow-2xl shadow-primary/10">
          <Image
            src={content.image.src}
            alt={content.image.alt}
            width={content.image.width}
            height={content.image.height}
            priority
            className="h-auto w-full"
          />
        </div>
      </div>
    </section>
  );
}
