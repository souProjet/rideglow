import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Configurator } from "@/components/funnel/configurator";
import { getDictionary } from "@/i18n";
import { isLocale } from "@/i18n/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: getDictionary(locale).nav.configure, robots: { index: false } };
}

export default async function ConfiguratorPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return <Configurator t={getDictionary(locale)} locale={locale} />;
}
