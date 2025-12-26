import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Box,
  Typography,
} from "@mui/material";

type WireColor = "red" | "blue" | "black";

type OccurrenceRow = {
  occurrenceLabel: string;
  cutIfConnectedTo: string;
};

const RED: OccurrenceRow[] = [
  { occurrenceLabel: "First red occurrence", cutIfConnectedTo: "C" },
  { occurrenceLabel: "Second red occurrence", cutIfConnectedTo: "B" },
  { occurrenceLabel: "Third red occurrence", cutIfConnectedTo: "A" },
  { occurrenceLabel: "Fourth red occurrence", cutIfConnectedTo: "A or C" },
  { occurrenceLabel: "Fifth red occurrence", cutIfConnectedTo: "B" },
  { occurrenceLabel: "Sixth red occurrence", cutIfConnectedTo: "A or C" },
  { occurrenceLabel: "Seventh red occurrence", cutIfConnectedTo: "A, B, C" },
  { occurrenceLabel: "Eighth red occurrence", cutIfConnectedTo: "A or B" },
  { occurrenceLabel: "Ninth red occurrence", cutIfConnectedTo: "B" },
];

const BLUE: OccurrenceRow[] = [
  { occurrenceLabel: "First blue occurrence", cutIfConnectedTo: "B" },
  { occurrenceLabel: "Second blue occurrence", cutIfConnectedTo: "A or C" },
  { occurrenceLabel: "Third blue occurrence", cutIfConnectedTo: "B" },
  { occurrenceLabel: "Fourth blue occurrence", cutIfConnectedTo: "A" },
  { occurrenceLabel: "Fifth blue occurrence", cutIfConnectedTo: "B" },
  { occurrenceLabel: "Sixth blue occurrence", cutIfConnectedTo: "B or C" },
  { occurrenceLabel: "Seventh blue occurrence", cutIfConnectedTo: "C" },
  { occurrenceLabel: "Eighth blue occurrence", cutIfConnectedTo: "A or C" },
  { occurrenceLabel: "Ninth blue occurrence", cutIfConnectedTo: "A" },
];

const BLACK: OccurrenceRow[] = [
  { occurrenceLabel: "First black occurrence", cutIfConnectedTo: "A, B, C" },
  { occurrenceLabel: "Second black occurrence", cutIfConnectedTo: "A or C" },
  { occurrenceLabel: "Third black occurrence", cutIfConnectedTo: "B" },
  { occurrenceLabel: "Fourth black occurrence", cutIfConnectedTo: "A or C" },
  { occurrenceLabel: "Fifth black occurrence", cutIfConnectedTo: "B" },
  { occurrenceLabel: "Sixth black occurrence", cutIfConnectedTo: "B or C" },
  { occurrenceLabel: "Seventh black occurrence", cutIfConnectedTo: "A or B" },
  { occurrenceLabel: "Eighth black occurrence", cutIfConnectedTo: "C" },
  { occurrenceLabel: "Ninth black occurrence", cutIfConnectedTo: "C" },
];

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
      <Box
        sx={{
          display: "flex",
          alignItems: "center", // pionowe wyśrodkowanie
          justifyContent: "flex-start",
          mb: 1,
        }}
      >
        <Button variant="contained" color="error" onClick={handleReset}>
          Reset
        </Button>

        <Typography
          variant="h5"
          sx={{ ml: 2 }} // lekki lewy margines
        >
          Password
        </Typography>
      </Box>

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
                  Red Wire Occurrences
                </Typography>
              </TableCell>
              <TableCell align="center" colSpan={2} sx={groupHeaderSx(4)}>
                <Typography sx={{ color: "blue" }}>
                  Blue Wire Occurrences
                </Typography>
              </TableCell>
              <TableCell align="center" colSpan={2} sx={groupHeaderSx(6)}>
                <Typography sx={{ color: "black" }}>
                  Black Wire Occurrences
                </Typography>
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell sx={headerCellSx(1)}>Wire Occurrence</TableCell>
              <TableCell sx={headerCellSx(2)}>Cut if connected to</TableCell>

              <TableCell sx={headerCellSx(3)}>Wire Occurrence</TableCell>
              <TableCell sx={headerCellSx(4)}>Cut if connected to</TableCell>

              <TableCell sx={headerCellSx(5)}>Wire Occurrence</TableCell>
              <TableCell sx={headerCellSx(6)}>Cut if connected to</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {Array.from({ length: 9 }).map((_, i) => (
              <TableRow key={i} hover>
                <TableCell
                  sx={cellSx("red", i, 1)}
                  onClick={() => handleClick("red", i)}
                >
                  {RED[i].occurrenceLabel}
                </TableCell>
                <TableCell
                  sx={cellSx("red", i, 2)}
                  onClick={() => handleClick("red", i)}
                >
                  {RED[i].cutIfConnectedTo}
                </TableCell>

                <TableCell
                  sx={cellSx("blue", i, 3)}
                  onClick={() => handleClick("blue", i)}
                >
                  {BLUE[i].occurrenceLabel}
                </TableCell>
                <TableCell
                  sx={cellSx("blue", i, 4)}
                  onClick={() => handleClick("blue", i)}
                >
                  {BLUE[i].cutIfConnectedTo}
                </TableCell>

                <TableCell
                  sx={cellSx("black", i, 5)}
                  onClick={() => handleClick("black", i)}
                >
                  {BLACK[i].occurrenceLabel}
                </TableCell>
                <TableCell
                  sx={cellSx("black", i, 6)}
                  onClick={() => handleClick("black", i)}
                >
                  {BLACK[i].cutIfConnectedTo}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
