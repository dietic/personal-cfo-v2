import en from "@/locales/en.json";
import es from "@/locales/es.json";

export type Locale = "en" | "es";

const DICTS = { en, es } as const;

export function t(locale: Locale, path: string): string {
  const parts = path.split(".");
  let cur: any = DICTS[locale as Locale];
  for (const p of parts) {
    cur = cur?.[p];
    if (cur == null) return path;
  }
  return typeof cur === "string" ? cur : path;
}
