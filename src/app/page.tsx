import { cache } from "react";
import type { Metadata } from "next";

import { CtaBand } from "@/components/sections/cta-band";
import { Features } from "@/components/sections/features";
import { Hero } from "@/components/sections/hero";
import { LogoCloud } from "@/components/sections/logo-cloud";
import { SiteFooter } from "@/components/sections/site-footer";
import { SiteNav } from "@/components/sections/site-nav";
import { Testimonials } from "@/components/sections/testimonials";
import { loadContent } from "@/lib/content/store";

const getContent = cache(() => loadContent("home"));

export async function generateMetadata(): Promise<Metadata> {
  const { seo } = await getContent();
  return { title: seo.title, description: seo.description };
}

export default async function HomePage() {
  const content = await getContent();

  return (
    <>
      <SiteNav content={content.nav} />
      <main className="flex-1">
        <Hero content={content.hero} />
        <LogoCloud content={content.logos} />
        <Features content={content.features} />
        <Testimonials content={content.testimonials} />
        <CtaBand content={content.cta} />
      </main>
      <SiteFooter content={content.footer} />
    </>
  );
}
