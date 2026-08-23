import type { HomeContent } from "@/content/pages/home";

export function LogoCloud({ content }: { content: HomeContent["logos"] }) {
  return (
    <section className="border-b border-border/60 bg-muted/30">
      <div className="mx-auto w-full max-w-6xl px-6 py-12">
        <p className="text-center text-xs font-medium tracking-widest text-muted-foreground uppercase">
          {content.caption}
        </p>
        <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {content.items.map((item) => (
            <li key={item.name} className="text-sm font-medium text-muted-foreground/80">
              {item.name}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
