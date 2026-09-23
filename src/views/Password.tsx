import React, { useMemo, useEffect, useState, useRef } from "react";
import { useAppStore } from "../store/AppStore";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import ModuleHeader from "../components/ModuleHeader";

const WORD_LENGTH = 5;
const MAX_COL_LETTERS = 6;

function uniquePreserveOrder(chars: string[]) {
  const out: string[] = [];
  for (const c of chars) if (!out.includes(c)) out.push(c);
  return out;
}

export default function Password() {
  const t = useAppStore((s) => s.t);

  // Bezpieczne pobieranie danych z pliku językowego (żeby TS i runtime się nie wywalały)
  const words: string[] = Array.isArray(t?.passwordWords)
    ? t.passwordWords
    : [];
  const helpText: string =
    typeof t?.passwordHelpText === "string" ? t.passwordHelpText : "";
  const pwUi = (t?.ui?.password ?? {}) as Record<string, string>;
  const pwTitle = pwUi.title ?? "Password";

  const hasLanguageData = words.length > 0;

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [columnInputs, setColumnInputs] = useState<string[]>(
    Array.from({ length: WORD_LENGTH }, () => "")
  );

  useEffect(() => {
    if (!hasLanguageData) return;
    inputRefs.current[0]?.focus();
  }, [hasLanguageData]);

  const reset = () => {
    setColumnInputs(Array.from({ length: WORD_LENGTH }, () => ""));
  };

  useEffect(() => {
    const id = setTimeout(() => reset(), 0);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [words]);

  const handleInputKeyDown = (
    e: React.KeyboardEvent<HTMLElement>,
    colIdx: number
  ) => {
    if (e.key !== "Tab") return;
    e.preventDefault();
    const dir = e.shiftKey ? -1 : 1;
    const nextIdx = (colIdx + dir + WORD_LENGTH) % WORD_LENGTH;
    inputRefs.current[nextIdx]?.focus();
  };

  function parseKTNEColumnInputWithAllowed(raw: string, allowed: Set<string>) {
    const letters = raw
      .normalize("NFC")
      .toLowerCase()
      .split("")
      .filter((ch) => /\p{L}/u.test(ch))
      .filter((ch) => allowed.has(ch));

    const unique = uniquePreserveOrder(letters).slice(0, MAX_COL_LETTERS);
    return unique.join("");
  }

  const lettersByColumn = useMemo(() => {
    const result: string[][] = Array.from({ length: WORD_LENGTH }, () => []);
    for (const w of words) {
      for (let i = 0; i < WORD_LENGTH; i++) {
        const ch = w[i];
        if (!result[i].includes(ch)) result[i].push(ch);
      }
    }
    result.forEach((col) => col.sort((a, b) => a.localeCompare(b)));
    return result;
  }, [words]);

  const allowedSets = useMemo(() => {
    return columnInputs.map((s) => new Set(s.split("")));
  }, [columnInputs]);

  const filteredWords = useMemo(() => {
    return words.filter((word) => {
      for (let i = 0; i < WORD_LENGTH; i++) {
        const set = allowedSets[i];
        if (set.size === 0) continue;
        if (!set.has(word[i])) return false;
      }
      return true;
    });
  }, [words, allowedSets]);

  const activeLettersByColumn = useMemo(() => {
    const result: Set<string>[] = Array.from(
      { length: WORD_LENGTH },
      () => new Set<string>()
    );
    for (const w of filteredWords) {
      for (let i = 0; i < WORD_LENGTH; i++) result[i].add(w[i]);
    }
    return result;
  }, [filteredWords]);

  const handleColumnInputChange = (colIdx: number, raw: string) => {
    const allowed = new Set(lettersByColumn[colIdx]);
    const normalized = parseKTNEColumnInputWithAllowed(raw, allowed);

    setColumnInputs((prev) => {
      const next = [...prev];
      next[colIdx] = normalized;
      return next;
    });
  };

  const toggleLetterInColumn = (colIdx: number, letter: string) => {
    setColumnInputs((prev) => {
      const next = [...prev];
      const current = next[colIdx];
      const set = new Set(current.split(""));

      if (set.has(letter)) set.delete(letter);
      else {
        if (set.size >= MAX_COL_LETTERS) return prev;
        set.add(letter);
      }

      const order = lettersByColumn[colIdx];
      const ordered = order.filter((ch) => set.has(ch));
      for (const ch of set) if (!ordered.includes(ch)) ordered.push(ch);

      next[colIdx] = ordered.join("");
      return next;
    });
  };

  const noSelectSx = {
    userSelect: "none",
    WebkitUserSelect: "none",
    MozUserSelect: "none",
    msUserSelect: "none",
  } as const;

  const preventMouseDownSelect = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  // Jeśli nie ma danych w pliku językowym, nie renderujemy logiki modułu (żeby nic nie wybuchało)
  const noData = (t as Record<string, unknown>)?.ui as
    | { common?: { noData?: string } }
    | undefined;
  if (!hasLanguageData) {
    return (
      <Box sx={noSelectSx}>
        <ModuleHeader title={pwTitle} onReset={reset} helpText={helpText} />
        <Typography variant="body1">{noData?.common?.noData ?? "No data."}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={noSelectSx}>
      <ModuleHeader title={pwTitle} onReset={reset} helpText={helpText} />

      <Box
        sx={{
          ...noSelectSx,
          display: "flex",
          gap: "2rem",
          alignItems: "flex-start",
        }}
        onMouseDown={preventMouseDownSelect}
      >
        {/* Kolumny */}
        <Box sx={{ ...noSelectSx, display: "flex", gap: "1rem" }}>
          {lettersByColumn.map((letters, colIdx) => (
            <Box
              key={colIdx}
              sx={{ ...noSelectSx, display: "flex", flexDirection: "column" }}
            >
              <TextField
                size="small"
                label={(pwUi.posN ?? "Position {n}").replace("{n}", String(colIdx + 1))}
                value={columnInputs[colIdx]}
                onChange={(e) =>
                  handleColumnInputChange(colIdx, e.target.value)
                }
                onKeyDown={(e) => handleInputKeyDown(e, colIdx)}
                inputRef={(el) => (inputRefs.current[colIdx] = el)}
                onMouseDown={(e) => e.stopPropagation()}
                sx={{ mb: 1, width: "120px" }}
                helperText={`${columnInputs[colIdx].length}/${MAX_COL_LETTERS}`}
                slotProps={{
                  input: {
                    spellCheck: false,
                    autoCapitalize: "none",
                    autoCorrect: "off",
                  },
                }}
              />

              {letters.map((letter) => {
                const selected = allowedSets[colIdx].has(letter);
                const stillPossible = activeLettersByColumn[colIdx].has(letter);

                return (
                  <button
                    key={letter}
                    onClick={() => toggleLetterInColumn(colIdx, letter)}
                    onMouseDown={preventMouseDownSelect}
                    style={{
                      userSelect: "none",
                      WebkitUserSelect: "none",
                      width: "30px",
                      height: "30px",
                      padding: 0,
                      margin: "2px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: selected ? "#4caf50" : "#eee",
                      color: selected
                        ? "#fff"
                        : stillPossible
                          ? "red"
                          : "black",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontWeight: 600,
                      opacity:
                        allowedSets[colIdx].size === 0
                          ? 1
                          : stillPossible || selected
                            ? 1
                            : 0.6,
                    }}
                  >
                    {letter}
                  </button>
                );
              })}
            </Box>
          ))}
        </Box>

        {/* Wyniki */}
        <Box sx={{ ...noSelectSx, minWidth: "320px" }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            {(pwUi.candidates ?? "").replace("{n}", String(filteredWords.length))}
          </Typography>

          <Box
            sx={{
              ...noSelectSx,
              display: "flex",
              gap: "0.5rem",
              flexWrap: "wrap",
            }}
          >
            {filteredWords.map((word) => (
              <Box
                key={word}
                onMouseDown={preventMouseDownSelect}
                sx={{
                  ...noSelectSx,
                  padding: "0.5rem 1rem",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                }}
              >
                {word}
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
