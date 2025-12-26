import React, { useMemo, useState, useCallback } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { KeypadImageById, type SymbolId } from "./KeypadImages";

const columns: SymbolId[][] = [
  ["venus", "a", "lambda", "zigzag_n", "h_triangle", "curly_y", "backwards_e"],
  [
    "e_umlaut",
    "venus",
    "backwards_e",
    "omega_loop",
    "star_outline",
    "curly_y",
    "hook_i",
  ],
  [
    "copyright",
    "heart",
    "omega_loop",
    "zhe_tail",
    "hook_r",
    "lambda",
    "star_outline",
  ],
  [
    "six",
    "pilcrow",
    "cyrillic_be",
    "h_triangle",
    "zhe_tail",
    "hook_i",
    "cup_dots",
  ],
  [
    "psi",
    "cup_dots",
    "cyrillic_be",
    "c_letter",
    "pilcrow",
    "three_hook",
    "star_filled",
  ],
  ["six", "e_umlaut", "hash", "ae", "psi", "cyrillic_iy", "omega"],
];

const MAX_SELECTED = 4;

export default function Keypad() {
  const [selected, setSelected] = useState<SymbolId[]>([]);
  const selectedSet = useMemo(() => new Set<SymbolId>(selected), [selected]);

  // wszystkie unikalne symbole (nic nie znika z listy u góry)
  const allUniqueSymbols = useMemo(() => {
    const seen = new Set<SymbolId>();
    const out: SymbolId[] = [];
    for (const col of columns) {
      for (const id of col) {
        if (!seen.has(id)) {
          seen.add(id);
          out.push(id);
        }
      }
    }
    return out;
  }, []);

  // kolumny jako sety dla szybkich sprawdzeń
  const columnSets = useMemo(
    () => columns.map((c) => new Set<SymbolId>(c)),
    [],
  );

  // które kolumny pasują do aktualnego selected (czyli zawierają wszystkie zaznaczone)
  const matchingColumnIdxs = useMemo(() => {
    if (selected.length === 0) return columns.map((_, idx) => idx);

    const idxs: number[] = [];
    for (let i = 0; i < columnSets.length; i++) {
      const colSet = columnSets[i];
      let ok = true;
      for (const s of selected) {
        if (!colSet.has(s)) {
          ok = false;
          break;
        }
      }
      if (ok) idxs.push(i);
    }
    return idxs;
  }, [selected, columnSets, columnSets.length]);

  const hasValidColumnForSelected =
    selected.length <= 1 ? true : matchingColumnIdxs.length > 0;

  // kandydat jest "możliwy do dodania", jeśli istnieje jakaś pasująca kolumna,
  // w której występuje też kandydat
  const canAddCandidate = useCallback(
    (candidate: SymbolId) => {
      if (selectedSet.has(candidate)) return true; // zawsze można odklikać
      if (selected.length >= MAX_SELECTED) return false;

      // jeśli już jesteśmy w złej kombinacji, nie ma sensu dodawać kolejnych
      // (odwracalność zapewnia odklikanie)
      if (selected.length > 1 && matchingColumnIdxs.length === 0) return false;

      for (const idx of matchingColumnIdxs) {
        if (columnSets[idx].has(candidate)) return true;
      }
      return false;
    },
    [selected.length, selectedSet, matchingColumnIdxs, columnSets],
  );

  const handleSymbolToggle = useCallback(
    (id: SymbolId) => {
      // odklik
      if (selectedSet.has(id)) {
        setSelected((prev) => prev.filter((x) => x !== id));
        return;
      }

      // dodaj tylko jeśli możliwe
      if (!canAddCandidate(id)) return;

      setSelected((prev) =>
        prev.length >= MAX_SELECTED ? prev : [...prev, id],
      );
    },
    [selectedSet, canAddCandidate],
  );

  const handleReset = useCallback(() => setSelected([]), []);

  const resolvedColumn = useMemo<SymbolId[] | null>(() => {
    if (matchingColumnIdxs.length === 1) {
      return columns[matchingColumnIdxs[0]];
    }
    return null;
  }, [matchingColumnIdxs]);

  const bottomList = useMemo<SymbolId[]>(() => {
    // jeśli kolumna jest jednoznaczna: bierzemy tylko zaznaczone 4,
    // ale w kolejności występowania w kolumnie
    if (resolvedColumn) {
      return resolvedColumn.filter((id) => selectedSet.has(id));
    }

    // jeśli jeszcze niejednoznaczne: pokaż (opcjonalnie) kolejność klikania
    return selected;
  }, [resolvedColumn, selectedSet, selected]);
  return (
    <Box
      sx={{
        userSelect: "none",
        WebkitUserSelect: "none",
        MozUserSelect: "none",
        msUserSelect: "none",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          mb: 2,
          gap: 2,
        }}
      >
        <Button variant="contained" color="error" onClick={handleReset}>
          Reset
        </Button>
        <Typography variant="h5">KEYPAD</Typography>

        <Typography variant="body2" sx={{ ml: "auto", opacity: 0.8 }}>
          Wybrane: {selected.length}/{MAX_SELECTED}
        </Typography>
      </Box>

      {!hasValidColumnForSelected && (
        <Typography
          variant="body1"
          sx={{ mb: 2, color: "error.main", fontWeight: 700 }}
        >
          Zła kombinacja
        </Typography>
      )}

      {/* GÓRA: zawsze wszystkie symbole; niepasujące są wyszarzone */}
      <Box
        sx={{
          display: "flex",
          gap: 1,
          flexWrap: "wrap",
          alignItems: "center",
          mb: 3,
        }}
      >
        {allUniqueSymbols.map((id) => {
          const isSelected = selectedSet.has(id);
          const isEnabled = canAddCandidate(id);
          const isDisabled = !isSelected && !isEnabled;

          return (
            <Box
              key={id}
              component="button"
              type="button"
              onClick={() => handleSymbolToggle(id)}
              disabled={isDisabled}
              sx={{
                p: 0.5,
                borderRadius: 1,
                border: "2px solid",
                borderColor: isSelected ? "success.main" : "divider",
                backgroundColor: isSelected
                  ? "action.selected"
                  : "background.paper",
                cursor: isDisabled ? "not-allowed" : "pointer",
                opacity: isDisabled ? 0.25 : 1,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",

                userSelect: "none",
                WebkitUserSelect: "none",
                MozUserSelect: "none",
                msUserSelect: "none",
                WebkitTapHighlightColor: "transparent",

                "&:hover": {
                  backgroundColor: isDisabled
                    ? "background.paper"
                    : "action.hover",
                },
              }}
              aria-label={id}
              title={id}
            >
              <Box
                component="img"
                src={KeypadImageById[id]}
                alt={id}
                draggable={false}
                sx={{
                  width: 40,
                  height: 40,
                  objectFit: "contain",
                  display: "block",
                  filter: isDisabled ? "grayscale(100%)" : "none",

                  userSelect: "none",
                  WebkitUserSelect: "none",
                  MozUserSelect: "none",
                  msUserSelect: "none",

                  pointerEvents: "none", // klik obsługuje parent-button, img nie "łapie" interakcji
                }}
              />
            </Box>
          );
        })}
      </Box>

      {/* DÓŁ: gdy kolumna jednoznaczna -> kolejność z kolumny; inaczej -> tymczasowo wybrane */}
      <Box
        sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}
      >
        {selected.length === 0 ? (
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            Zaznacz 4 symbole.
          </Typography>
        ) : (
          <>
            {bottomList.map((id) => (
              <Box
                key={id}
                sx={{
                  p: 1,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                title={id}
              >
                <Box
                  component="img"
                  src={KeypadImageById[id]}
                  alt={id}
                  draggable={false}
                  sx={{
                    width: 56,
                    height: 56,

                    userSelect: "none",
                    WebkitUserSelect: "none",
                    MozUserSelect: "none",
                    msUserSelect: "none",
                    pointerEvents: "none",
                  }}
                />
              </Box>
            ))}
            {resolvedColumn && (
              <Typography variant="body2" sx={{ opacity: 0.8, mr: 1 }}>
                Kolumna: {matchingColumnIdxs[0] + 1}
              </Typography>
            )}
          </>
        )}
      </Box>
    </Box>
  );
}
