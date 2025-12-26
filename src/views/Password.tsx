import React, { useState, useMemo, useEffect } from "react";
import { useAppStore } from "../store/AppStore";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export default function Password() {
  const t = useAppStore((s) => s.t);

  const words: string[] = t.passwordWords; // ['apple', 'arise', ...]
  const WORD_LENGTH = 5;

  // Stan: zaznaczone litery w każdej kolumnie
  const [selectedLetters, setSelectedLetters] = useState<Set<string>[]>(
    Array.from({ length: WORD_LENGTH }, () => new Set<string>()),
  );

  const toggleLetter = (col: number, letter: string) => {
    setSelectedLetters((prev) => {
      const newSelected = [...prev];
      const colSet = new Set(newSelected[col]);
      if (colSet.has(letter)) colSet.delete(letter);
      else colSet.add(letter);
      newSelected[col] = colSet;
      return newSelected;
    });
  };

  const resetSelection = () => {
    setSelectedLetters(
      Array.from({ length: WORD_LENGTH }, () => new Set<string>()),
    );
  };

  // patola wiem
  useEffect(() => {
    const id = setTimeout(() => resetSelection(), 0);
    return () => clearTimeout(id);
  }, [words]);

  // Litery w każdej kolumnie (wszystkie możliwe na starcie)
  const lettersByColumn = useMemo(() => {
    const result: string[][] = Array.from({ length: WORD_LENGTH }, () => []);
    words.forEach((word) => {
      for (let i = 0; i < WORD_LENGTH; i++) {
        if (!result[i].includes(word[i])) result[i].push(word[i]);
      }
    });
    return result;
  }, [words]);

  // Filtrowanie słów wg zaznaczonych liter
  const filteredWords = useMemo(() => {
    return words.filter((word) =>
      word
        .split("")
        .every((letter, idx) =>
          selectedLetters[idx].size === 0
            ? true
            : selectedLetters[idx].has(letter),
        ),
    );
  }, [words, selectedLetters]);

  // Wyliczamy litery, które wciąż mogą się pojawić w pasujących słowach
  const activeLettersByColumn = useMemo(() => {
    const result: Set<string>[] = Array.from(
      { length: WORD_LENGTH },
      () => new Set<string>(),
    );
    filteredWords.forEach((word) => {
      word.split("").forEach((letter, idx) => result[idx].add(letter));
    });
    return result;
  }, [filteredWords]);

  // Styl blokujący zaznaczanie (cross-browser)
  const noSelectSx = {
    userSelect: "none",
    WebkitUserSelect: "none",
    MozUserSelect: "none",
    msUserSelect: "none",
  } as const;

  // Dodatkowo blokuje inicjację zaznaczania przy mouse down
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
          mb: 1,
        }}
        onMouseDown={preventMouseDownSelect}
      >
        <Button
          variant="contained"
          color="error"
          onClick={resetSelection}
          // Button jest "interactive", ale nadal nie chcemy drag-select na nim
          sx={noSelectSx}
        >
          Reset
        </Button>

        <Typography variant="h5" sx={{ ml: 2, ...noSelectSx }}>
          Password
        </Typography>
      </Box>

      {/* Layout: kolumny liter po lewej, słowa po prawej */}
      <Box
        sx={{
          ...noSelectSx,
          display: "flex",
          gap: "2rem",
          alignItems: "flex-start",
        }}
        onMouseDown={preventMouseDownSelect}
      >
        {/* Kolumny liter */}
        <Box sx={{ ...noSelectSx, display: "flex", gap: "1rem" }}>
          {lettersByColumn.map((letters, colIdx) => (
            <Box
              key={colIdx}
              sx={{ ...noSelectSx, display: "flex", flexDirection: "column" }}
            >
              {letters.map((letter) => (
                <button
                  key={letter}
                  onClick={() => toggleLetter(colIdx, letter)}
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

                    backgroundColor: selectedLetters[colIdx].has(letter)
                      ? "#4caf50"
                      : "#eee",
                    color: selectedLetters[colIdx].has(letter)
                      ? "#fff"
                      : activeLettersByColumn[colIdx].has(letter)
                        ? "red"
                        : "black",

                    border: "1px solid #ccc",
                    borderRadius: "4px", // możesz dać 0 jeśli ma być idealny kwadrat
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  {letter}
                </button>
              ))}
            </Box>
          ))}
        </Box>

        {/* Filtrowane słowa */}
        <Box sx={{ ...noSelectSx }}>
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
