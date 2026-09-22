import * as React from "react";
import { Box, Button, Typography, Paper, Alert, AlertTitle } from "@mui/material";
import ModuleHeader from "../components/ModuleHeader";

interface Position {
  col: number; // 1..6
  row: number; // 1..6
}

// Wiarygodne dane labiryntów (KTANE vanilla, 9 labiryntów).
// Format ASCII 13x13: '#' = ściana, ' ' = korytarz, 'O' = zielone kółko.
// Pary kółek są stałe i rozłączne między labiryntami.
const MAZE_ASCII: string[][] = [
  [
    "#############",
    "#     #     #",
    "# ### # #####",
    "#O#   #     #",
    "# # ####### #",
    "# #   #    O#",
    "# ### # ### #",
    "# #     #   #",
    "# ######### #",
    "#     #   # #",
    "# ### # ### #",
    "#   #   #   #",
    "#############",
  ],
  [
    "#############",
    "#     #     #",
    "### ### # ###",
    "#   #   #O  #",
    "# ### ##### #",
    "# #   #     #",
    "# # ### ### #",
    "#  O#   # # #",
    "# ### ### # #",
    "# # # #   # #",
    "# # # # ### #",
    "# #   #     #",
    "#############",
  ],
  [
    "#############",
    "#     # #   #",
    "# ### # # # #",
    "# # # #   # #",
    "### # ##### #",
    "#   # #   # #",
    "# # # # # # #",
    "# # # #O# #O#",
    "# # # # # # #",
    "# #   # # # #",
    "# ##### # # #",
    "#       #   #",
    "#############",
  ],
  [
    "#############",
    "#O  #       #",
    "# # ####### #",
    "# # #       #",
    "# # # ##### #",
    "# #   #   # #",
    "# ##### #####",
    "#O#         #",
    "# ######### #",
    "#         # #",
    "# ####### # #",
    "#     #   # #",
    "#############",
  ],
  [
    "#############",
    "#           #",
    "######### # #",
    "#         # #",
    "# ##### #####",
    "#   #   #O  #",
    "# # ##### # #",
    "# #     # # #",
    "# ##### ### #",
    "# #       # #",
    "# # ####### #",
    "# #    O    #",
    "#############",
  ],
  [
    "#############",
    "# #   #  O  #",
    "# # # ### # #",
    "# # # #   # #",
    "# # # # ### #",
    "#   # # #   #",
    "# ##### # ###",
    "#   #   # # #",
    "### # # # # #",
    "#   #O# #   #",
    "# ##### ### #",
    "#       #   #",
    "#############",
  ],
  [
    "#############",
    "#  O    #   #",
    "# ##### # # #",
    "# #   #   # #",
    "# # ####### #",
    "#   #   #   #",
    "##### ### ###",
    "#   #     # #",
    "# # # ##### #",
    "# # #     # #",
    "# ####### # #",
    "#  O        #",
    "#############",
  ],
  [
    "#############",
    "# #    O#   #",
    "# # ### # # #",
    "#     #   # #",
    "# ######### #",
    "# #       # #",
    "# # ##### # #",
    "# #  O#     #",
    "# ### #######",
    "# # #       #",
    "# # #########",
    "#           #",
    "#############",
  ],
  [
    "#############",
    "# #         #",
    "# # ##### # #",
    "# # #O  # # #",
    "# # # ### # #",
    "#     #   # #",
    "# ##### ### #",
    "# # #   #   #",
    "# # # ##### #",
    "#O# # #   # #",
    "# # # # # ###",
    "#   #   #   #",
    "#############",
  ],
];

const MAZE_IDS = ["A", "B", "C", "D", "E", "F", "G", "H", "I"] as const;

interface ParsedMaze {
  id: string;
  indicators: Position[];
  walls: { up: boolean; down: boolean; left: boolean; right: boolean }[][]; // [row-1][col-1]
}

function parseMaze(ascii: string[], id: string): ParsedMaze {
  const indicators: Position[] = [];
  const walls: ParsedMaze["walls"] = [];
  for (let row = 1; row <= 6; row++) {
    const wallRow: ParsedMaze["walls"][number] = [];
    for (let col = 1; col <= 6; col++) {
      const ax = col * 2 - 1;
      const ay = row * 2 - 1;
      const up = ascii[ay - 1]?.[ax] === "#";
      const down = ascii[ay + 1]?.[ax] === "#";
      const left = ascii[ay]?.[ax - 1] === "#";
      const right = ascii[ay]?.[ax + 1] === "#";
      wallRow.push({ up, down, left, right });
    }
    walls.push(wallRow);
  }
  for (let y = 0; y < ascii.length; y++) {
    for (let x = 0; x < ascii[y].length; x++) {
      if (ascii[y][x] === "O") {
        indicators.push({ col: (x + 1) / 2, row: (y + 1) / 2 });
      }
    }
  }
  return { id, indicators, walls };
}

const PARSED_MAZES: ParsedMaze[] = MAZE_ASCII.map((a, i) =>
  parseMaze(a, MAZE_IDS[i])
);

const posKey = (col: number, row: number) => `${col},${row}`;

// mapa: pozycja kółka -> id labiryntu (zbiory rozłączne, więc 1:1)
const DOT_TO_MAZE = new Map<string, string>();
for (const m of PARSED_MAZES) {
  for (const p of m.indicators) DOT_TO_MAZE.set(posKey(p.col, p.row), m.id);
}

type Dir = "UP" | "DOWN" | "LEFT" | "RIGHT";

function solveMaze(maze: ParsedMaze, start: Position, end: Position): Dir[] {
  const key = (c: number, r: number) => `${c},${r}`;
  const prev = new Map<string, { from: string; dir: Dir }>();
  const visited = new Set<string>([key(start.col, start.row)]);
  const queue: Position[] = [{ ...start }];

  const moves: { dc: number; dr: number; dir: Dir; wall: "up" | "down" | "left" | "right" }[] = [
    { dc: 0, dr: -1, dir: "UP", wall: "up" },
    { dc: 1, dr: 0, dir: "RIGHT", wall: "right" },
    { dc: 0, dr: 1, dir: "DOWN", wall: "down" },
    { dc: -1, dr: 0, dir: "LEFT", wall: "left" },
  ];

  while (queue.length > 0) {
    const cur = queue.shift()!;
    if (cur.col === end.col && cur.row === end.row) break;
    const w = maze.walls[cur.row - 1][cur.col - 1];
    for (const m of moves) {
      if (w[m.wall]) continue;
      const nc = cur.col + m.dc;
      const nr = cur.row + m.dr;
      if (nc < 1 || nc > 6 || nr < 1 || nr > 6) continue;
      const k = key(nc, nr);
      if (visited.has(k)) continue;
      visited.add(k);
      prev.set(k, { from: key(cur.col, cur.row), dir: m.dir });
      queue.push({ col: nc, row: nr });
    }
  }

  const path: Dir[] = [];
  let curKey = key(end.col, end.row);
  const startKey = key(start.col, start.row);
  if (curKey !== startKey && !prev.has(curKey)) return [];
  while (curKey !== startKey) {
    const p = prev.get(curKey);
    if (!p) break;
    path.unshift(p.dir);
    curKey = p.from;
  }
  return path;
}

function pathCells(start: Position, path: Dir[]): Map<string, number> {
  const map = new Map<string, number>();
  let { col, row } = start;
  map.set(`${col},${row}`, 0);
  path.forEach((d, i) => {
    if (d === "UP") row -= 1;
    if (d === "DOWN") row += 1;
    if (d === "LEFT") col -= 1;
    if (d === "RIGHT") col += 1;
    map.set(`${col},${row}`, i + 1);
  });
  return map;
}

const CELL = 46;
const ARROW: Record<Dir, string> = { UP: "↑", DOWN: "↓", LEFT: "←", RIGHT: "→" };

export default function Maze() {
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [hoverId, setHoverId] = React.useState<string | null>(null);
  const [phase, setPhase] = React.useState<"maze" | "start" | "end">("maze");
  const [startPos, setStartPos] = React.useState<Position | null>(null);
  const [endPos, setEndPos] = React.useState<Position | null>(null);

  const selected = PARSED_MAZES.find((m) => m.id === selectedId) ?? null;
  // do podglądu ścian: wybrany, a jak nie ma — najechany
  const preview = selected ?? PARSED_MAZES.find((m) => m.id === hoverId) ?? null;

  const solution = React.useMemo(() => {
    if (!selected || !startPos || !endPos) return [];
    return solveMaze(selected, startPos, endPos);
  }, [selected, startPos, endPos]);

  const solutionCells = React.useMemo(() => {
    if (!startPos || solution.length === 0) return new Map<string, number>();
    return pathCells(startPos, solution);
  }, [startPos, solution]);

  const resetAll = () => {
    setSelectedId(null);
    setHoverId(null);
    setPhase("maze");
    setStartPos(null);
    setEndPos(null);
  };

  const changeMaze = () => {
    setSelectedId(null);
    setPhase("maze");
    setStartPos(null);
    setEndPos(null);
  };

  const handleCellClick = (col: number, row: number) => {
    const dotMaze = DOT_TO_MAZE.get(posKey(col, row));

    if (phase === "maze") {
      // wybór labiryntu przez kliknięcie dowolnego kółka z pary
      if (dotMaze) {
        setSelectedId(dotMaze);
        setStartPos(null);
        setEndPos(null);
        setPhase("start");
      }
      return;
    }
    if (phase === "start") {
      // startu nie stawiamy na kółku wybranego labiryntu
      if (selected?.indicators.some((p) => p.col === col && p.row === row)) return;
      setStartPos({ col, row });
      setEndPos(null);
      setPhase("end");
      return;
    }
    // phase === "end"
    if (selected?.indicators.some((p) => p.col === col && p.row === row)) return;
    if (startPos && startPos.col === col && startPos.row === row) return;
    setEndPos({ col, row });
  };

  const handleCellEnter = (col: number, row: number) => {
    if (phase !== "maze" || selectedId) return;
    const dotMaze = DOT_TO_MAZE.get(posKey(col, row));
    setHoverId(dotMaze ?? null);
  };

  // stopień podświetlenia kółka
  const dotOpacity = (col: number, row: number): number => {
    const dotMaze = DOT_TO_MAZE.get(posKey(col, row));
    if (!dotMaze) return 0;
    if (selectedId) return dotMaze === selectedId ? 1 : 0.08;
    if (hoverId) return dotMaze === hoverId ? 1 : 0.15;
    return 0.85; // przed wyborem wszystkie narysowane
  };

  const isPairDot = (col: number, row: number): boolean =>
    DOT_TO_MAZE.has(posKey(col, row));

  const renderCellContent = (col: number, row: number) => {
    const opacity = dotOpacity(col, row);
    const isDot = isPairDot(col, row);
    const isStart = startPos?.col === col && startPos?.row === row;
    const isEnd = endPos?.col === col && endPos?.row === row;
    const step = solutionCells.get(`${col},${row}`);
    let arrow: Dir | null = null;
    if (startPos && solution.length > 0 && step !== undefined && step < solution.length) {
      arrow = solution[step];
    }
    return (
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: step !== undefined ? "rgba(76,175,80,0.30)" : "transparent",
          fontSize: 20,
          fontWeight: 700,
        }}
      >
        {isDot && (
          <Box
            sx={{
              color: "#2e7d32",
              fontSize: selectedId || hoverId ? 28 : 24,
              opacity,
              transform:
                (selectedId && DOT_TO_MAZE.get(posKey(col, row)) === selectedId) ||
                (hoverId && DOT_TO_MAZE.get(posKey(col, row)) === hoverId)
                  ? "scale(1.15)"
                  : "scale(1)",
              transition: "opacity 120ms, transform 120ms",
              lineHeight: 1,
            }}
          >
            ●
          </Box>
        )}
        {isStart && (
          <Box
            sx={{
              width: 22,
              height: 22,
              bgcolor: "#fff",
              border: "3px solid #1976d2",
              borderRadius: "4px",
              position: isDot ? "absolute" : "static",
            }}
          />
        )}
        {isEnd && (
          <Box
            sx={{
              color: "#d32f2f",
              fontSize: 26,
              lineHeight: 1,
              position: isDot ? "absolute" : "static",
            }}
          >
            ▲
          </Box>
        )}
        {!isStart && !isEnd && arrow && (
          <Box sx={{ color: "#1b5e20", fontSize: 22, position: isDot ? "absolute" : "static" }}>
            {ARROW[arrow]}
          </Box>
        )}
        {isStart && arrow && step === 0 && (
          <Box sx={{ position: "absolute", bottom: 1, right: 3, fontSize: 14, color: "#1b5e20" }}>
            {ARROW[arrow]}
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Box sx={{ userSelect: "none" }}>
      <ModuleHeader
        title="Labirynt / Maze"
        onReset={resetAll}
        requiredData={["POZYCJE ZIELONYCH KÓŁEK"]}
        helpText="Na planszy od razu widać wszystkie stałe kółka (9 par). Najedź myszką na kółko — reszta się wyszarzy, a podświetli się tylko ta para. Kliknij kółko żeby wybrać labirynt, potem kliknij start (biały kwadrat) i cel (czerwony trójkąt). Program pokaże najkrótszą drogę (BFS)."
      />

      <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap", alignItems: "center" }}>
        <Button
          variant={phase === "maze" ? "contained" : "outlined"}
          color="success"
          onClick={() => setPhase("maze")}
        >
          1. Kółka {selected ? `(${selected.id}) ✓` : hoverId ? `(${hoverId}?)` : ""}
        </Button>
        <Button
          variant={phase === "start" ? "contained" : "outlined"}
          color="info"
          onClick={() => selected && setPhase("start")}
          disabled={!selected}
        >
          2. Start □
        </Button>
        <Button
          variant={phase === "end" ? "contained" : "outlined"}
          color="error"
          onClick={() => startPos && setPhase("end")}
          disabled={!startPos}
        >
          3. Cel ▲
        </Button>
        {selected && (
          <Button variant="text" onClick={changeMaze}>
            Zmień labirynt
          </Button>
        )}
        <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 0.5 }}>
          {PARSED_MAZES.map((m) => (
            <Button
              key={m.id}
              size="small"
              variant={selectedId === m.id ? "contained" : hoverId === m.id ? "outlined" : "text"}
              color="success"
              onMouseEnter={() => !selectedId && setHoverId(m.id)}
              onMouseLeave={() => !selectedId && setHoverId(null)}
              onClick={() => {
                setSelectedId(m.id);
                setStartPos(null);
                setEndPos(null);
                setPhase("start");
              }}
              sx={{ minWidth: 32 }}
            >
              {m.id}
            </Button>
          ))}
        </Box>
      </Box>

      <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap", alignItems: "flex-start" }}>
        <Paper elevation={2} sx={{ p: 2, display: "inline-block" }} onMouseLeave={() => setHoverId(null)}>
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            {[1, 2, 3, 4, 5, 6].map((row) => (
              <Box key={row} sx={{ display: "flex" }}>
                {[1, 2, 3, 4, 5, 6].map((col) => {
                  const w = preview?.walls[row - 1][col - 1];
                  const dimmed = !selected && hoverId && DOT_TO_MAZE.get(posKey(col, row)) !== hoverId;
                  return (
                    <Box
                      key={`${col}-${row}`}
                      onClick={() => handleCellClick(col, row)}
                      onMouseEnter={() => handleCellEnter(col, row)}
                      title={`${col},${row}`}
                      sx={{
                        width: CELL,
                        height: CELL,
                        cursor: phase === "maze" ? (isPairDot(col, row) ? "pointer" : "default") : "pointer",
                        boxSizing: "border-box",
                        opacity: dimmed ? 0.45 : 1,
                        borderTop: w ? (w.up ? "4px solid #111" : "1px dashed rgba(0,0,0,0.25)") : "1px solid rgba(0,0,0,0.2)",
                        borderLeft: w ? (w.left ? "4px solid #111" : "1px dashed rgba(0,0,0,0.25)") : "1px solid rgba(0,0,0,0.2)",
                        borderRight:
                          col === 6
                            ? w
                              ? w.right
                                ? "4px solid #111"
                                : "1px dashed rgba(0,0,0,0.25)"
                              : "1px solid rgba(0,0,0,0.2)"
                            : "none",
                        borderBottom:
                          row === 6
                            ? w
                              ? w.down
                                ? "4px solid #111"
                                : "1px dashed rgba(0,0,0,0.25)"
                              : "1px solid rgba(0,0,0,0.2)"
                            : w
                              ? w.down
                                ? "4px solid #111"
                                : "1px dashed rgba(0,0,0,0.25)"
                              : "1px solid rgba(0,0,0,0.2)",
                        "&:hover": { bgcolor: "rgba(0,0,0,0.05)" },
                      }}
                    >
                      {renderCellContent(col, row)}
                    </Box>
                  );
                })}
              </Box>
            ))}
          </Box>
          <Typography variant="caption" sx={{ opacity: 0.6 }}>
            kolumny 1–6 od lewej, wiersze 1–6 od góry • najedź na kółko żeby zobaczyć parę
          </Typography>
        </Paper>

        <Box sx={{ minWidth: 260, maxWidth: 420, flex: 1 }}>
          {!selected && (
            <Alert severity="info" sx={{ mb: 1 }}>
              {hoverId
                ? `Podgląd pary ${hoverId}: ${PARSED_MAZES.find((m) => m.id === hoverId)!
                    .indicators.map((p) => `(${p.col},${p.row})`)
                    .join(" + ")} — kliknij kółko żeby wybrać.`
                : "Najedź na dowolne kółko — zostanie tylko jego stała para, reszta się wyszarzy. Kliknij żeby wybrać labirynt."}
            </Alert>
          )}
          {selected && (
            <Typography variant="body2" sx={{ mb: 1 }}>
              Labirynt {selected.id}: kółka{" "}
              {selected.indicators.map((p) => `(${p.col},${p.row})`).join(" + ")}
            </Typography>
          )}
          {solution.length > 0 && startPos && endPos && (
            <Alert severity="success" sx={{ mb: 1 }}>
              <AlertTitle>
                Do celu w {solution.length} ruchach ({startPos.col},{startPos.row}) → ({endPos.col},{endPos.row})
              </AlertTitle>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, fontSize: 20, fontWeight: 700 }}>
                {solution.map((d, i) => (
                  <span key={i}>{ARROW[d]}</span>
                ))}
              </Box>
              <Typography variant="body2" sx={{ mt: 1 }}>
                {solution
                  .map((d) =>
                    d === "UP" ? "góra" : d === "DOWN" ? "dół" : d === "LEFT" ? "lewo" : "prawo"
                  )
                  .join(" → ")}
              </Typography>
            </Alert>
          )}
          {selected && startPos && endPos && solution.length === 0 && (
            <Alert severity="error">Brak przejścia — sprawdź punkty.</Alert>
          )}
          {selected && !startPos && (
            <Alert severity="info">Kliknij pole startu (biały kwadrat).</Alert>
          )}
          {selected && startPos && !endPos && (
            <Alert severity="info">Kliknij pole celu (czerwony trójkąt).</Alert>
          )}
        </Box>
      </Box>
    </Box>
  );
}
