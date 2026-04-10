import { cookies } from "next/headers";

import translations from "@/lib/translations.generated.json";
import { DEFAULT_LOCALE, type Locale, normalizeLocale } from "@/lib/config";

type Messages = Record<string, string>;
type TranslationTree = Record<Locale, Messages>;

const allTranslations = translations as TranslationTree;

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  return normalizeLocale(cookieStore.get("ui_locale")?.value);
}

export function getMessages(locale: Locale): Messages {
  return allTranslations[locale] || allTranslations[DEFAULT_LOCALE];
}

export function translate(
  locale: Locale,
  key: string,
  vars?: Record<string, string | number>,
): string {
  let message = getMessages(locale)[key] ?? key;

  if (vars) {
    for (const [name, value] of Object.entries(vars)) {
      message = message.replaceAll(`{${name}}`, String(value));
    }
  }

  return message;
}
