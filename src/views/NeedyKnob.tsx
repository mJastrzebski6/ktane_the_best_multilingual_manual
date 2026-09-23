import * as React from "react";
import { Alert, AlertTitle, Box, Button, Paper, Typography } from "@mui/material";
import ModuleHeader from "../components/ModuleHeader";
import { fmt, useAppStore } from "../store/AppStore";

type KnobDir = "UP" | "DOWN" | "LEFT" | "RIGHT";
type Mode = "left" | "minimum" | "right";

const DIR_ARROW: Record<KnobDir, string> = {
  UP: "↑",
  DOWN: "↓",
  LEFT: "←",
  RIGHT: "→",
};

// Kanoniczna tabela z manuala: 8 konfiguracji (2 na pozycję), 2 rzędy × 6 kolumn.
// true = zapalony LED. Kolumny 0–5 od lewej.
const PATTERNS: { dir: KnobDir; grid: boolean[][] }[] = [
  {
    dir: "UP",
    grid: [
      [false, false, true, false, true, true],
      [true, true, true, true, false, true],
    ],
  },
  {
    dir: "UP",
    grid: [
      [true, false, true, false, true, false],
      [false, true, true, false, true, true],
    ],
  },
  {
    dir: "DOWN",
    grid: [
      [false, true, true, false, false, true],
      [true, true, true, true, false, true],
    ],
  },
  {
    dir: "DOWN",
    grid: [
      [true, false, true, false, true, false],
      [false, true, false, false, false, true],
    ],
  },
  {
    dir: "LEFT",
    grid: [
      [false, false, false, false, true, false],
      [true, false, false, true, true, true],
    ],
  },
  {
    dir: "LEFT",
    grid: [
      [false, false, false, false, true, false],
      [false, false, false, true, true, false],
    ],
  },
  {
    dir: "RIGHT",
    grid: [
      [true, false, true, true, true, true],
      [true, true, true, false, true, false],
    ],
  },
  {
    dir: "RIGHT",
    grid: [
      [true, false, true, true, false, false],
      [true, true, true, false, true, false],
    ],
  },
];

const leftKey = (leds: boolean[][]) =>
  [0, 1, 2].map((c) => `${leds[0][c] ? 1 : 0}${leds[1][c] ? 1 : 0}`).join("");
const rightKey = (leds: boolean[][]) =>
  [3, 4, 5].map((c) => `${leds[0][c] ? 1 : 0}${leds[1][c] ? 1 : 0}`).join("");
// MINIMUM: 2 górne z lewej + 2 dolne z prawej (reszta ignorowana)
const MIN_CELLS: [number, number][] = [
  [0, 0],
  [0, 1],
  [1, 4],
  [1, 5],
];
const minKey = (leds: boolean[][]) =>
  MIN_CELLS.map(([r, c]) => (leds[r][c] ? 1 : 0)).join("");

function solveLeft(leds: boolean[][]): KnobDir | null {
  const k = leftKey(leds);
  const dirs = PATTERNS.filter((p) => leftKey(p.grid) === k).map((p) => p.dir);
  if (dirs.length === 0) return null;
  return dirs.every((d) => d === dirs[0]) ? dirs[0] : null;
}

function solveRight(leds: boolean[][]): KnobDir | null {
  const k = rightKey(leds);
  const dirs = PATTERNS.filter((p) => rightKey(p.grid) === k).map((p) => p.dir);
  if (dirs.length === 0) return null;
  return dirs.every((d) => d === dirs[0]) ? dirs[0] : null;
}

/** Metoda MINIMUM: 2 pierwsze kolumny z lewej + 2 ostatnie z prawej. */
function solveMinimum(leds: boolean[][]): KnobDir | null {
  const k = minKey(leds);
  const dirs = PATTERNS.filter((p) => minKey(p.grid) === k).map((p) => p.dir);
  if (dirs.length === 0) return null;
  return dirs.every((d) => d === dirs[0]) ? dirs[0] : null;
}

const emptyLeds = () =>
  Array.from({ length: 2 }, () => Array.from({ length: 6 }, () => false));

export default function NeedyKnob() {
  const [mode, setMode] = React.useState<Mode>("minimum");
  const [leds, setLeds] = React.useState<boolean[][]>(emptyLeds);
  const kb = (useAppStore((s) => s.t?.ui?.knob) ?? {}) as Record<string, string>;
  const dirWord = (d: KnobDir) =>
    d === "UP" ? (kb.dirUp ?? d) : d === "DOWN" ? (kb.dirDown ?? d) : d === "LEFT" ? (kb.dirLeft ?? d) : (kb.dirRight ?? d);

  const reset = () => setLeds(emptyLeds());

  const toggle = (r: number, c: number) => {
    // w danym trybie klikalne są tylko używane LED-y
    if (mode === "right" && c < 3) return;
    if (mode === "left" && c > 2) return;
    if (mode === "minimum" && !MIN_CELLS.some(([mr, mc]) => mr === r && mc === c)) return;
    setLeds((prev) => {
      const next = prev.map((row) => [...row]);
      next[r][c] = !next[r][c];
      return next;
    });
  };

  const result: KnobDir | null =
    mode === "left" ? solveLeft(leds) : mode === "right" ? solveRight(leds) : solveMinimum(leds);

  const isActive = (r: number, c: number) =>
    mode === "right" ? c >= 3 : mode === "left" ? c <= 2 : MIN_CELLS.some(([mr, mc]) => mr === r && mc === c);

  return (
    <Box sx={{ userSelect: "none" }}>
      <ModuleHeader
        title={kb.title ?? "Knob"}
        onReset={reset}
        helpText={kb.help}
      />

      <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
        {kb.modeLabel ?? ""}
      </Typography>
      <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
        {(
          [
            { v: "left" as Mode, label: kb.modeLeft ?? "" },
            { v: "minimum" as Mode, label: kb.modeMin ?? "" },
            { v: "right" as Mode, label: kb.modeRight ?? "" },
          ]
        ).map((o) => (
          <Button
            key={o.v}
            variant={mode === o.v ? "contained" : "outlined"}
            color={mode === o.v ? "success" : "inherit"}
            onClick={() => {
              setMode(o.v);
              setLeds(emptyLeds());
            }}
            sx={{ fontWeight: 800 }}
          >
            {o.label}
          </Button>
        ))}
      </Box>

      <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap", alignItems: "flex-start" }}>
        <Paper elevation={2} sx={{ p: 2, display: "inline-block" }}>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
            {mode === "right" ? (kb.clickRight ?? "") : mode === "left" ? (kb.clickLeft ?? "") : (kb.clickMin ?? "")}
          </Typography>
          {[0, 1].map((r) => (
            <Box key={r} sx={{ display: "flex", gap: 1.2, mb: 1.2 }}>
              {[0, 1, 2, 3, 4, 5].map((c) => {
                const active = isActive(r, c);
                const on = leds[r][c];
                return (
                  <Box
                    key={c}
                    onClick={() => toggle(r, c)}
                    title={`rząd ${r + 1}, kolumna ${c + 1}`}
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      cursor: active ? "pointer" : "default",
                      opacity: active ? 1 : 0.18,
                      bgcolor: on ? "#ffeb3b" : "rgba(0,0,0,0.12)",
                      border: on ? "3px solid #f9a825" : "2px solid rgba(0,0,0,0.35)",
                      boxShadow: on ? "0 0 10px 2px rgba(249,168,37,0.7)" : "none",
                      boxSizing: "border-box",
                    }}
                  />
                );
              })}
            </Box>
          ))}
          <Typography variant="caption" sx={{ opacity: 0.6 }}>
            {kb.ignoreNote ?? ""}
          </Typography>
        </Paper>

        <Box sx={{ minWidth: 280, maxWidth: 440, flex: 1 }}>
          {result ? (
            <Alert severity="success">
              <AlertTitle sx={{ fontWeight: 900, fontSize: 22 }}>
                {fmt(kb.resultTitle ?? "", { d: dirWord(result), a: DIR_ARROW[result] })}
              </AlertTitle>
              <Typography variant="body2">
                {mode === "minimum"
                  ? (kb.howMin ?? "")
                  : mode === "left"
                    ? (kb.howLeft ?? "")
                    : (kb.howRight ?? "")}
              </Typography>
            </Alert>
          ) : (
            <Alert severity="info">
              {kb.noMatch ?? ""}
            </Alert>
          )}
        </Box>
      </Box>
    </Box>
  );
}
