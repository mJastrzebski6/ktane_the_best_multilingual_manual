import { useMemo } from "react";
import { useAppStore } from "../store/AppStore";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import ModuleHeader from "../components/ModuleHeader";

type WhosFirstRow = {
  key: string;
  words: string[];
};

type PositionCode = "P_G" | "P_Ś" | "P_D" | "L_G" | "L_Ś" | "L_D";

function takeUntilIncludingKey(words: string[], key: string): string[] {
  const idx = words.indexOf(key);
  if (idx === -1) return words;
  return words.slice(0, idx + 1);
}

function parsePosition(pos?: string): PositionCode | null {
  if (!pos) return null;
  const allowed: Record<string, true> = {
    P_G: true,
    P_Ś: true,
    P_D: true,
    L_G: true,
    L_Ś: true,
    L_D: true,
  };
  return allowed[pos] ? (pos as PositionCode) : null;
}

function positionLabel(pos: PositionCode) {
  const [col, row] = pos.split("_") as ["P" | "L", "G" | "Ś" | "D"];

  const colName = col === "P" ? "Lewo" : "Prawo";
  const rowName = row === "G" ? "Góra" : row === "Ś" ? "Środek" : "Dół";

  return { short: `${col}/${row}`, long: `${colName} / ${rowName}` };
}

export default function WhosOnFirst() {
  const t = useAppStore((s) => s.t);

  const table = (t.whosfirstwordstable ?? []) as WhosFirstRow[];
  const helpText: string = useAppStore((s) => s.t.whosonfirstHelpText);

  const rows = useMemo(() => {
    return [...table]
      .sort((a, b) => a.key.localeCompare(b.key, "pl"))
      .map((row) => ({
        key: row.key,
        clippedWords: takeUntilIncludingKey(row.words, row.key),
      }));
  }, [table]);

  // Mapowanie: słowo -> pozycja (statycznie wyświetlane nad tabelą)
  const positionPairs = useMemo(() => {
    const raw = (t.whosfirstpositiontable ?? {}) as Record<string, string>;

    return Object.entries(raw)
      .map(([k, v]) => {
        const key = (k ?? "").trim().toUpperCase();
        const pos = parsePosition((v ?? "").trim());
        return key && pos ? { key, pos } : null;
      })
      .filter((x): x is { key: string; pos: PositionCode } => Boolean(x))
      .sort((a, b) => a.key.localeCompare(b.key, "pl"));
  }, [t.whosfirstpositiontable]);

  return (
    <Box>
      <ModuleHeader title="Who's on First" helpText={helpText} />

      {/* STATYCZNA LISTA: CO → GDZIE */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
          {positionPairs.map(({ key, pos }) => {
            const lab = positionLabel(pos);
            return (
              <Chip
                key={key}
                variant="outlined"
                label={`${key} → ${lab.short}`}
                title={`${key} → ${pos} (${lab.long})`}
              />
            );
          })}

          {positionPairs.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              No data in this language file
            </Typography>
          )}
        </Stack>
      </Paper>

      <TableContainer component={Paper} variant="outlined">
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, width: 180 }}>
                Słowo klucz
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>
                Słowa (do momentu wystąpienia klucza włącznie)
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.key} hover>
                <TableCell sx={{ fontWeight: 700 }}>{r.key}</TableCell>
                <TableCell sx={{ whiteSpace: "normal" }}>
                  {r.clippedWords.join(", ")}
                </TableCell>
              </TableRow>
            ))}

            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={2}>No data in this language file</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
