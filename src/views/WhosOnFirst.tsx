import React, { useMemo } from "react";
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

type WhosFirstRow = {
  key: string;
  words: string[];
};

function takeUntilIncludingKey(words: string[], key: string): string[] {
  const idx = words.indexOf(key);
  if (idx === -1) return words;
  return words.slice(0, idx + 1);
}

export default function WhosOnFirst() {
  const t = useAppStore((s) => s.t);

  const table = (t.whosfirstwordtable ?? []) as WhosFirstRow[];

  const rows = useMemo(() => {
    return [...table]
      .sort((a, b) => a.key.localeCompare(b.key, "pl"))
      .map((row) => ({
        key: row.key,
        clippedWords: takeUntilIncludingKey(row.words, row.key),
      }));
  }, [table]);

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Who&apos;s on First
      </Typography>

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
                <TableCell colSpan={2}>
                  Brak danych w t.whosfirstwordtable
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
