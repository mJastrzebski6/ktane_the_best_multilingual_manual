import React, { useMemo, useEffect, useState, useRef } from "react";
import { useAppStore } from "../store/AppStore";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";

const WORD_LENGTH = 5;
const MAX_COL_LETTERS = 6; // KTNE: każda kolumna ma 6 liter

function uniquePreserveOrder(chars: string[]) {
  const out: string[] = [];
  for (const c of chars) if (!out.includes(c)) out.push(c);
  return out;
}

function parseKTNEColumnInput(raw: string) {
  // KTNE: interesują nas wyłącznie litery A-Z, bez spacji i separatorów
  const letters = raw
    .toLowerCase()
    .split("")
    .filter((ch) => ch >= "a" && ch <= "z");
  const unique = uniquePreserveOrder(letters).slice(0, MAX_COL_LETTERS);
  return unique.join("");
}

export default function Password() {
  const t = useAppStore((s) => s.t);
  const words: string[] = t.passwordWords; // lista KTNE (5-literowe)

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // INPUTY są źródłem prawdy: każdy string = zbiór dozwolonych liter w kolumnie
  const [columnInputs, setColumnInputs] = useState<string[]>(
    Array.from({ length: WORD_LENGTH }, () => "")
  );

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const reset = () => {
    setColumnInputs(Array.from({ length: WORD_LENGTH }, () => ""));
  };

  // jeśli lista słów się zmienia, czyścimy (jak u Ciebie)
  useEffect(() => {
    const id = setTimeout(() => reset(), 0);
    return () => clearTimeout(id);
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [words]);

const handleInputKeyDown = (
  e: React.KeyboardEvent<HTMLElement>,
  colIdx: number
) => {
  if (e.key === "ArrowLeft") {
    e.preventDefault();
    inputRefs.current[colIdx - 1]?.focus();
  }

  if (e.key === "ArrowRight") {
    e.preventDefault();
    inputRefs.current[colIdx + 1]?.focus();
  }
};

  // Litery dostępne w każdej kolumnie (do wyświetlenia przycisków)
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

  // Z inputów robimy Sety (do szybkich sprawdzeń i kolorowania)
  const allowedSets = useMemo(() => {
    return columnInputs.map((s) => new Set(s.split("")));
  }, [columnInputs]);

  // KTNE filtrowanie: pusta kolumna = brak ograniczenia
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

  // Litery, które nadal występują w pasujących słowach (do podpowiedzi/kolorów)
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
    const normalized = parseKTNEColumnInput(raw);
    setColumnInputs((prev) => {
      const next = [...prev];
      next[colIdx] = normalized;
      return next;
    });
  };

  // Klik w literę: dodaj/usuń ją w danym input stringu (a więc i w zbiorze)
  const toggleLetterInColumn = (colIdx: number, letter: string) => {
    setColumnInputs((prev) => {
      const next = [...prev];
      const current = next[colIdx];
      const set = new Set(current.split(""));

      if (set.has(letter)) set.delete(letter);
      else {
        if (set.size >= MAX_COL_LETTERS) {
          // KTNE ma 6 liter w kolumnie, więc nie pozwalamy przekroczyć.
          // Jeśli chcesz zamiast tego "wypychać" najstarszą literę, zmienię.
          return prev;
        }
        set.add(letter);
      }

      // Zachowujemy stabilny porządek: zgodnie z lettersByColumn (alfabetycznie w tej implementacji)
      const order = lettersByColumn[colIdx];
      const ordered = order.filter((ch) => set.has(ch));

      // Jeśli klikniesz literę, której nie ma w order (teoretycznie nie powinno),
      // dołączamy ją na koniec.
      for (const ch of set) if (!ordered.includes(ch)) ordered.push(ch);

      next[colIdx] = ordered.join("");
      return next;
    });
  };

  // Styl blokujący zaznaczanie
  const noSelectSx = {
    userSelect: "none",
    WebkitUserSelect: "none",
    MozUserSelect: "none",
    msUserSelect: "none",
  } as const;

  const preventMouseDownSelect = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  return (
    <Box sx={noSelectSx}>
      <Box
        sx={{
          ...noSelectSx,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          mb: 3,
      
        }}
        onMouseDown={preventMouseDownSelect}
      >
        <Button variant="contained" color="error" onClick={reset} sx={noSelectSx}>
          Reset
        </Button>

        <Typography variant="h5" sx={{ ml: 2, ...noSelectSx }}>
          Password
        </Typography>

        <Typography variant="body2" sx={{ ml: 2, opacity: 0.7 }}>
          Wpisz litery widoczne w kolumnie (max 6). Pusta kolumna = brak ograniczenia.
        </Typography>
      </Box>

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
              label={`Pozycja ${colIdx + 1}`}
              value={columnInputs[colIdx]}
              onChange={(e) => handleColumnInputChange(colIdx, e.target.value)}
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
                      color: selected ? "#fff" : stillPossible ? "red" : "black",
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
            Kandydaci: {filteredWords.length}
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
