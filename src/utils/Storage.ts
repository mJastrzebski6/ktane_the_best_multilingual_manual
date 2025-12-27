const LANG_STORAGE_KEY = "app.lang";
const DEFAULT_LANG = "en";

export function readStoredLang(availableKeys: string[]): string {
  const raw = localStorage.getItem(LANG_STORAGE_KEY);
  if (raw && availableKeys.includes(raw)) return raw;
  return DEFAULT_LANG;
}

export function storeLang(lng: string) {
  localStorage.setItem(LANG_STORAGE_KEY, lng);
}
