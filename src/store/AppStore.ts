/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";

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
 * Trójstanowy fakt: true / false / null ("?" = jeszcze nie wpisano).
 */
export type TriBool = boolean | null;

/**
 * Liczba baterii z saturacją:
 * 0, 1, 2, 3 (gdzie 3 oznacza "3 lub więcej"), null = "?" (nie wpisano).
 */
export type BatteryCount = 0 | 1 | 2 | 3 | null;

/**
 * Resetowalne, "bomb facts" / cechy, które użytkownik może ustawiać globalnie.
 * null = "?" — user jeszcze nie wpisał.
 */
export type ResettableBombFacts = {
  serialLastDigitEven: TriBool;
  serialHasVowel: TriBool;
  indicatorCAR: TriBool;
  indicatorFRK: TriBool;
  hasParallelPort: TriBool;

  // baterie jako liczba (0/1/2/3+) lub null ("?")
  batteryCount: BatteryCount;
};

export type FactKey = keyof ResettableBombFacts;

/** Duże, czytelne etykiety faktów do banerów "UZUPEŁNIJ". */
export const FACT_LABELS: Record<FactKey, string> = {
  serialLastDigitEven: "PARZYSTOŚĆ OSTATNIEJ CYFRY NUMERU SERYJNEGO",
  serialHasVowel: "SAMOGŁOSKA W NUMERZE SERYJNYM",
  indicatorCAR: "WSKAŹNIK CAR (czy się świeci)",
  indicatorFRK: "WSKAŹNIK FRK (czy się świeci)",
  hasParallelPort: "PORT RÓWNOLEGŁY",
  batteryCount: "LICZBA BATERII",
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
  serialLastDigitEven: null,
  serialHasVowel: null,
  indicatorCAR: null,
  indicatorFRK: null,
  hasParallelPort: null,

  batteryCount: null,
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
