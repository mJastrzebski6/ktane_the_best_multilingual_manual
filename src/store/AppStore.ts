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

/**
 * Resetowalne, "bomb facts" / cechy, które użytkownik może ustawiać globalnie.
 * (W store masz też inne pola zależne od języka – tych nie ruszamy resetem.)
 */
type ResettableBombFacts = {
  serialLastDigitEven: boolean;
  serialHasVowel: boolean;
  indicatorCAR: boolean;
  indicatorFRK: boolean;
  hasParallelPort: boolean;

  // baterie: trzy poziomy z implikacjami (więcej niż 2 => 2+ => więcej niż 1)
  batteriesMoreThan1: boolean; // "więcej niż 1 bateria"
  batteries2OrMore: boolean; // "2 lub więcej baterii"
  batteriesMoreThan2: boolean; // "więcej niż 2 baterie"
};

type AppState = {
  // language
  lang: string;
  t: LanguageFile;
  availableLangs: { key: string; label: string }[];
  setLang: (lang: string) => void;

  // view
  activeView: ViewId;
  setActiveView: (view: ViewId) => void;

  // resetowalna logika globalnego state
  bombFacts: ResettableBombFacts;

  setBombFacts: (patch: Partial<ResettableBombFacts>) => void;

  // dedykowane settery (z logiką zależności)
  setBatteryFlag: (
    key: "batteriesMoreThan1" | "batteries2OrMore" | "batteriesMoreThan2",
    value: boolean,
  ) => void;

  resetBombFacts: () => void;
};

const defaultLang = availableLangs[0]?.key;

const defaultBombFacts: ResettableBombFacts = {
  serialLastDigitEven: false,
  serialHasVowel: false,
  indicatorCAR: false,
  indicatorFRK: false,
  hasParallelPort: false,

  batteriesMoreThan1: false,
  batteries2OrMore: false,
  batteriesMoreThan2: false,
};

export const useAppStore = create<AppState>((set, get) => ({
  // language
  lang: defaultLang,
  t: languages[defaultLang],
  availableLangs,

  setLang: (lang) =>
    set({
      lang,
      t: languages[lang],
    }),

  // view
  activeView: "wire_horizontal",
  setActiveView: (view) => set({ activeView: view }),

  // bomb facts
  bombFacts: defaultBombFacts,

  setBombFacts: (patch) =>
    set((state) => ({
      bombFacts: { ...state.bombFacts, ...patch },
    })),

  setBatteryFlag: (key, value) => {
    const current = get().bombFacts;

    // baza
    const next: ResettableBombFacts = { ...current, [key]: value };

    // Implikacje "w górę"
    if (key === "batteriesMoreThan2" && value) {
      next.batteries2OrMore = true;
      next.batteriesMoreThan1 = true;
    }
    if (key === "batteries2OrMore" && value) {
      next.batteriesMoreThan1 = true;
    }

    // Spójne wyłączanie "w dół"
    if (key === "batteriesMoreThan1" && !value) {
      next.batteries2OrMore = false;
      next.batteriesMoreThan2 = false;
    }
    if (key === "batteries2OrMore" && !value) {
      next.batteriesMoreThan2 = false;
    }

    set({ bombFacts: next });
  },

  resetBombFacts: () => set({ bombFacts: defaultBombFacts }),
}));
