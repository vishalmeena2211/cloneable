import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { loadTheme, themeToCss } from "@/lib/theme/theme";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cloneable",
  description: "Clone any website into a customizable template",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const theme = await loadTheme();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {/*
          Tokens from content/theme.json. The selectors are `html:root`, which
          outranks the `:root` defaults in globals.css on specificity, so this
          applies regardless of where the browser places the block.
        */}
        <style dangerouslySetInnerHTML={{ __html: themeToCss(theme) }} />
        {children}
      </body>
    </html>
  );
}
