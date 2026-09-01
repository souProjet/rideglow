import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import "@/app/globals.css";
import { GlowSync } from "@/components/glow-sync";
import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";
import { getDictionary } from "@/i18n";
import { isLocale, LOCALES } from "@/i18n/config";
import { archivo, martianMono } from "@/lib/fonts";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);

  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t.meta.title, template: "%s | RideGlow" },
    description: t.meta.description,
    alternates: {
      canonical: `/${locale}`,
      languages: Object.fromEntries(LOCALES.map((l) => [l, `/${l}`])),
    },
    openGraph: {
      type: "website",
      locale: locale === "fr" ? "fr_FR" : "en_GB",
      url: `/${locale}`,
      title: t.meta.title,
      description: t.meta.description,
      siteName: "RideGlow",
    },
    twitter: { card: "summary_large_image", title: t.meta.title, description: t.meta.description },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);

  return (
    <html lang={locale} className={`${archivo.variable} ${martianMono.variable}`}>
      <body>
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-chalk focus:px-4 focus:py-2 focus:text-ink"
        >
          {t.nav.skipToContent}
        </a>
        <GlowSync />
        <SiteHeader locale={locale} t={t} />
        <main id="content">{children}</main>
        <SiteFooter locale={locale} t={t} />
      </body>
    </html>
  );
}
