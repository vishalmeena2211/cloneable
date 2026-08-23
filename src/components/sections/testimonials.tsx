import type { HomeContent } from "@/content/pages/home";

export function Testimonials({ content }: { content: HomeContent["testimonials"] }) {
  return (
    <section id="how" className="border-b border-border/60 bg-muted/30">
      <div className="mx-auto w-full max-w-6xl px-6 py-20 sm:py-24">
        <h2 className="text-center text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          {content.title}
        </h2>

        <ul className="mt-14 grid gap-6 lg:grid-cols-3">
          {content.items.map((item) => (
            <li
              key={item.name}
              className="flex flex-col rounded-xl border border-border bg-card p-6"
            >
              <p className="flex-1 text-sm leading-relaxed text-pretty">
                &ldquo;{item.quote}&rdquo;
              </p>
              <div className="mt-6 border-t border-border pt-4">
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.role}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
