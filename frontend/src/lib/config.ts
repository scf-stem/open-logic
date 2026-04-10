export const DEFAULT_LOCALE = "en";
export const SUPPORTED_LOCALES = ["en", "zh"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const backendBaseUrl =
  process.env.BACKEND_BASE_URL || "http://127.0.0.1:8080";

export function normalizeLocale(input?: string | null): Locale {
  if (input && SUPPORTED_LOCALES.includes(input as Locale)) {
    return input as Locale;
  }
  return DEFAULT_LOCALE;
}
