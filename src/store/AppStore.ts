/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";

// 👇 automatycznie ładuje wszystkie jsony z i18n
const languageModules = import.meta.glob("../i18n/*.json", {
  eager: true,
});

type LanguageFile = {
  language: string;
  code: string;
  [key: string]: any;
};

const languages: Record<string, LanguageFile> = {};
const availableLangs: { key: string; label: string }[] = [];

Object.entries(languageModules).forEach(([path, module]: any) => {
  const key = path.split("/").pop()?.replace(".json", "");
  if (!key) return;

  const data = module.default as LanguageFile;

  languages[key] = data;
  availableLangs.push({
    key,
    label: `${data.language} (${data.code})`,
  });
});

export type ViewId =
  | "wire_horizontal"
  | "wire_vertical"
  | "wire_ABC"
  | "big_button"
  | "keypad"
  | "maze"
  | "memory"
  | "morse"
  | "needy_knob"
  | "password"
  | "simon"
  | "whos_on_first";

type AppState = {
  lang: string;
  t: LanguageFile;
  availableLangs: { key: string; label: string }[];
  setLang: (lang: string) => void;
  activeView: ViewId;
  setActiveView: (view: ViewId) => void;
};

const defaultLang = availableLangs[0]?.key;

export const useAppStore = create<AppState>((set) => ({
  lang: defaultLang,
  t: languages[defaultLang],
  availableLangs,
  activeView: "wire_horizontal",

  setLang: (lang) =>
    set({
      lang,
      t: languages[lang],
    }),

  setActiveView: (view) => set({ activeView: view }),
}));
