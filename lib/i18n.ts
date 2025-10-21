import en from "@/locales/en.json";
import es from "@/locales/es.json";

export type Locale = "en" | "es";

const DICTS = { en, es } as const;

type DeepRecord = { [key: string]: string | DeepRecord };

export function t(locale: Locale, path: string): string {
  const parts = path.split(".");
  let cur: string | DeepRecord = DICTS[locale as Locale];
  for (const p of parts) {
    if (typeof cur === "object" && cur !== null) {
      cur = cur[p];
    } else {
      return path;
    }
    if (cur == null) return path;
  }
  return typeof cur === "string" ? cur : path;
}
