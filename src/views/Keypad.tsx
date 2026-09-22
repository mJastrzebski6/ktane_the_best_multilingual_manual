import { useMemo, useState, useCallback } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ModuleHeader from "../components/ModuleHeader";
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

  const columnSets = useMemo(
    () => columns.map((c) => new Set<SymbolId>(c)),
    []
  );

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
  }, [selected, columnSets]);

  const hasValidColumnForSelected =
    selected.length <= 1 ? true : matchingColumnIdxs.length > 0;

  const canAddCandidate = useCallback(
    (candidate: SymbolId) => {
      if (selectedSet.has(candidate)) return true;
      if (selected.length >= MAX_SELECTED) return false;
      if (selected.length > 1 && matchingColumnIdxs.length === 0) return false;

      for (const idx of matchingColumnIdxs) {
        if (columnSets[idx].has(candidate)) return true;
      }
      return false;
    },
    [selected.length, selectedSet, matchingColumnIdxs, columnSets]
  );

  const handleSymbolToggle = useCallback(
    (id: SymbolId) => {
      if (selectedSet.has(id)) {
        setSelected((prev) => prev.filter((x) => x !== id));
        return;
      }
      if (!canAddCandidate(id)) return;
      setSelected((prev) =>
        prev.length >= MAX_SELECTED ? prev : [...prev, id]
      );
    },
    [selectedSet, canAddCandidate]
  );

  const handleReset = useCallback(() => setSelected([]), []);

  const resolvedColumn = useMemo<SymbolId[] | null>(() => {
    if (matchingColumnIdxs.length === 1) return columns[matchingColumnIdxs[0]];
    return null;
  }, [matchingColumnIdxs]);

  const bottomList = useMemo<SymbolId[]>(() => {
    if (resolvedColumn)
      return resolvedColumn.filter((id) => selectedSet.has(id));
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
      <ModuleHeader title="KEYPAD" onReset={handleReset} />

      <Typography variant="body2" sx={{ mb: 2, opacity: 0.8 }}>
        Wybrane: {selected.length}/{MAX_SELECTED}
      </Typography>

      {!hasValidColumnForSelected && (
        <Typography
          variant="body1"
          sx={{ mb: 2, color: "error.main", fontWeight: 700 }}
        >
          Zła kombinacja
        </Typography>
      )}

      {/* GÓRA: zawsze wszystkie symbole w gridzie 9×3; niepasujące są wyszarzone */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(9, minmax(0, 1fr))",
          gap: 1,
          alignItems: "stretch",
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
                width: "100%",
                aspectRatio: "1 / 1",
                borderRadius: 1,
                border: "2px solid",
                borderColor: isSelected ? "success.main" : "divider",
                backgroundColor: isSelected
                  ? "action.selected"
                  : "background.paper",
                cursor: isDisabled ? "not-allowed" : "pointer",
                opacity: isDisabled ? 0.05 : 1,
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
                  width: "85%",
                  height: "85%",
                  objectFit: "contain",
                  display: "block",
                  filter: isDisabled ? "grayscale(100%)" : "none",
                  userSelect: "none",
                  WebkitUserSelect: "none",
                  MozUserSelect: "none",
                  msUserSelect: "none",
                  pointerEvents: "none",
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
