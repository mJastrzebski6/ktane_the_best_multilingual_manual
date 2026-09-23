import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
} from "@mui/material";
import { useAppStore } from "../store/AppStore";
import ModuleHeader from "../components/ModuleHeader";

type WireColor = "red" | "blue" | "black";

// Cele z manuala (które litery A/B/C), kolejność wierszy 1–9.
const TARGETS: Record<WireColor, string[][]> = {
  red: [["C"], ["B"], ["A"], ["A", "C"], ["B"], ["A", "C"], ["A", "B", "C"], ["A", "B"], ["B"]],
  blue: [["B"], ["A", "C"], ["B"], ["A"], ["B"], ["B", "C"], ["C"], ["A", "C"], ["A"]],
  black: [["A", "B", "C"], ["A", "C"], ["B"], ["A", "C"], ["B"], ["B", "C"], ["A", "B"], ["C"], ["C"]],
};

const FALLBACK_ORDINALS = ["First", "Second", "Third", "Fourth", "Fifth", "Sixth", "Seventh", "Eighth", "Ninth"];

function occurrenceLabel(sq: Record<string, unknown>, color: WireColor, i: number): string {
  const ordinals = (sq.ordinals as string[] | undefined) ?? FALLBACK_ORDINALS;
  const occurrence = (sq.occurrence as string | undefined) ?? "occurrence";
  const adj =
    color === "red" ? ((sq.red as string | undefined) ?? "red")
    : color === "blue" ? ((sq.blue as string | undefined) ?? "blue")
    : ((sq.black as string | undefined) ?? "black");
  return `${ordinals[i] ?? `#${i + 1}`} ${adj} ${occurrence}`;
}

function cutLabel(targets: string[], orWord: string): string {
  if (targets.length >= 3) return targets.join(", ");
  if (targets.length === 2) return `${targets[0]} ${orWord} ${targets[1]}`;
  return targets[0] ?? "";
}

const HIGHLIGHT: Record<WireColor, string> = {
  red: "rgba(244, 67, 54, 0.40)",
  blue: "rgba(33, 150, 243, 0.40)",
  black: "rgba(0, 0, 0, 0.22)",
};

function isHighlighted(
  rowIndex: number,
  selectedIndex: number | null
): boolean {
  return selectedIndex !== null && rowIndex <= selectedIndex;
}

const EMPTY_SELECTED: Record<WireColor, number | null> = {
  red: null,
  blue: null,
  black: null,
};

export default function WireABC() {
  const sq = (useAppStore((s) => s.t?.ui?.seq) ?? {}) as Record<string, unknown>;
  const orWord = (sq.orWord as string | undefined) ?? "or";
  const [selected, setSelected] =
    React.useState<Record<WireColor, number | null>>(EMPTY_SELECTED);

  const handleReset = () => setSelected(EMPTY_SELECTED);

  const handleClick = (color: WireColor, rowIndex: number) => {
    setSelected((prev) => {
      const cur = prev[color];

      if (cur === null) {
        return rowIndex === 0 ? { ...prev, [color]: 0 } : prev;
      }

      if (rowIndex === cur) {
        const next = cur - 1;
        return { ...prev, [color]: next >= 0 ? next : null };
      }

      if (rowIndex === cur + 1) {
        return { ...prev, [color]: rowIndex };
      }

      return prev;
    });
  };

  const thickRightBorderAfterCol = (colIndex1to6: number) =>
    colIndex1to6 === 2 || colIndex1to6 === 4
      ? { borderRight: "3px solid rgba(0,0,0,0.65)" }
      : undefined;

  const cellSx = (
    color: WireColor,
    rowIndex: number,
    colIndex1to6: number
  ) => ({
    cursor: "pointer",
    userSelect: "none" as const,
    transition: "background-color 120ms ease-in-out",
    backgroundColor: isHighlighted(rowIndex, selected[color])
      ? HIGHLIGHT[color]
      : "transparent",
    ...(thickRightBorderAfterCol(colIndex1to6) ?? {}),
  });

  const headerCellSx = (colIndex1to6: number) => ({
    fontWeight: 600,
    ...(thickRightBorderAfterCol(colIndex1to6) ?? {}),
  });

  const groupHeaderSx = (endAtColIndex1to6: number) => ({
    fontWeight: 700,
    ...(thickRightBorderAfterCol(endAtColIndex1to6) ?? {}),
  });

  return (
    <Box>
      <ModuleHeader
        title={(sq.title as string | undefined) ?? "Wire Sequence"}
        onReset={handleReset}
        helpText={(sq.help as string | undefined) ?? ""}
      />

      <TableContainer component={Paper} elevation={2}>
        <Table
          size="small"
          aria-label="Wire rules table"
          sx={{ "& td, & th": { borderColor: "rgba(0,0,0,0.35)" } }}
        >
          <TableHead>
            <TableRow>
              <TableCell align="center" colSpan={2} sx={groupHeaderSx(2)}>
                <Typography sx={{ color: "red" }}>
                  {(sq.groupRed as string | undefined) ?? ""}
                </Typography>
              </TableCell>
              <TableCell align="center" colSpan={2} sx={groupHeaderSx(4)}>
                <Typography sx={{ color: "blue" }}>
                  {(sq.groupBlue as string | undefined) ?? ""}
                </Typography>
              </TableCell>
              <TableCell align="center" colSpan={2} sx={groupHeaderSx(6)}>
                <Typography sx={{ color: "black" }}>
                  {(sq.groupBlack as string | undefined) ?? ""}
                </Typography>
              </TableCell>
            </TableRow>

            <TableRow sx={{ borderBottom: "3px solid rgba(0,0,0,0.35)" }}>
              <TableCell sx={headerCellSx(1)}>{(sq.colOcc as string | undefined) ?? ""}</TableCell>
              <TableCell sx={headerCellSx(2)}>{(sq.colCut as string | undefined) ?? ""}</TableCell>

              <TableCell sx={headerCellSx(3)}>{(sq.colOcc as string | undefined) ?? ""}</TableCell>
              <TableCell sx={headerCellSx(4)}>{(sq.colCut as string | undefined) ?? ""}</TableCell>

              <TableCell sx={headerCellSx(5)}>{(sq.colOcc as string | undefined) ?? ""}</TableCell>
              <TableCell sx={headerCellSx(6)}>{(sq.colCut as string | undefined) ?? ""}</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {Array.from({ length: 9 }).map((_, i) => (
              <TableRow key={i} hover>
                <TableCell
                  sx={cellSx("red", i, 1)}
                  onClick={() => handleClick("red", i)}
                >
                  {occurrenceLabel(sq, "red", i)}
                </TableCell>
                <TableCell
                  sx={cellSx("red", i, 2)}
                  onClick={() => handleClick("red", i)}
                >
                  {cutLabel(TARGETS.red[i], orWord)}
                </TableCell>

                <TableCell
                  sx={cellSx("blue", i, 3)}
                  onClick={() => handleClick("blue", i)}
                >
                  {occurrenceLabel(sq, "blue", i)}
                </TableCell>
                <TableCell
                  sx={cellSx("blue", i, 4)}
                  onClick={() => handleClick("blue", i)}
                >
                  {cutLabel(TARGETS.blue[i], orWord)}
                </TableCell>

                <TableCell
                  sx={cellSx("black", i, 5)}
                  onClick={() => handleClick("black", i)}
                >
                  {occurrenceLabel(sq, "black", i)}
                </TableCell>
                <TableCell
                  sx={cellSx("black", i, 6)}
                  onClick={() => handleClick("black", i)}
                >
                  {cutLabel(TARGETS.black[i], orWord)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
