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
 * Liczba baterii z saturacją:
 * 0, 1, 2, 3 (gdzie 3 oznacza "3 lub więcej")
 */
export type BatteryCount = 0 | 1 | 2 | 3;

/**
 * Resetowalne, "bomb facts" / cechy, które użytkownik może ustawiać globalnie.
 */
type ResettableBombFacts = {
  serialLastDigitEven: boolean;
  serialHasVowel: boolean;
  indicatorCAR: boolean;
  indicatorFRK: boolean;
  hasParallelPort: boolean;

  // baterie jako liczba (0/1/2/3+)
  batteryCount: BatteryCount;
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

  // bomb facts
  bombFacts: ResettableBombFacts;
  setBombFacts: (patch: Partial<ResettableBombFacts>) => void;

  // dedykowany setter na baterie
  setBatteryCount: (count: BatteryCount) => void;

  resetBombFacts: () => void;
};

const defaultLang = availableLangs[0]?.key ?? "en";

const defaultBombFacts: ResettableBombFacts = {
  serialLastDigitEven: false,
  serialHasVowel: false,
  indicatorCAR: false,
  indicatorFRK: false,
  hasParallelPort: false,

  batteryCount: 0,
};

export const useAppStore = create<AppState>((set) => ({
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

  setBatteryCount: (count) =>
    set((state) => ({
      bombFacts: { ...state.bombFacts, batteryCount: count },
    })),

  resetBombFacts: () => set({ bombFacts: defaultBombFacts }),
}));
