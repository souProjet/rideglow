import type { Locale } from "@/i18n/config";
import { en } from "@/i18n/en";
import { type Dictionary, fr } from "@/i18n/fr";

const DICTIONARIES: Record<Locale, Dictionary> = { fr, en };

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale];
}

export type { Dictionary };
