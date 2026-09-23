import * as React from "react";
import { Box, Button, Typography, Paper, Alert, AlertTitle } from "@mui/material";
import ContentCutIcon from "@mui/icons-material/ContentCut";
import UndoIcon from "@mui/icons-material/Undo";
import { fmt, useAppStore } from "../store/AppStore";
import ModuleHeader from "../components/ModuleHeader";
import MissingFactsBanner from "../components/MissingFactsBanner";

type WireColor = "red" | "blue" | "yellow" | "white" | "black";

type WireStrings = Record<string, string>;

const colorName = (c: WireColor, s: WireStrings) =>
  c === "red" ? (s.colorRed ?? c)
  : c === "blue" ? (s.colorBlue ?? c)
  : c === "yellow" ? (s.colorYellow ?? c)
  : c === "white" ? (s.colorWhite ?? c)
  : (s.colorBlack ?? c);

const COLOR_BG: Record<WireColor, string> = {
  red: "#d32f2f",
  blue: "#1976d2",
  yellow: "#fbc02d",
  white: "#f5f5f5",
  black: "#212121",
};

const ALL_COLORS: WireColor[] = ["red", "blue", "yellow", "white", "black"];

interface Solution {
  index: number; // 0-based, od góry
  rule: string;
}

function solveWires(wires: WireColor[], serialOdd: boolean, s: WireStrings): Solution {
  const n = wires.length;
  const count = (c: WireColor) => wires.filter((w) => w === c).length;
  const last = wires[n - 1];
  const lastIndexOf = (c: WireColor) => wires.lastIndexOf(c);

  if (n === 3) {
    if (count("red") === 0)
      return { index: 1, rule: s.r3a ?? "" };
    if (last === "white")
      return { index: 2, rule: s.r3b ?? "" };
    if (count("blue") > 1)
      return {
        index: lastIndexOf("blue"),
        rule: s.r3c ?? "",
      };
    return { index: 2, rule: s.r3d ?? "" };
  }

  if (n === 4) {
    if (count("red") > 1 && serialOdd)
      return {
        index: lastIndexOf("red"),
        rule: s.r4a ?? "",
      };
    if (last === "yellow" && count("red") === 0)
      return { index: 0, rule: s.r4b ?? "" };
    if (count("blue") === 1)
      return { index: 0, rule: s.r4c ?? "" };
    if (count("yellow") > 1)
      return { index: 3, rule: s.r4d ?? "" };
    return { index: 1, rule: s.r4e ?? "" };
  }

  if (n === 5) {
    if (last === "black" && serialOdd)
      return { index: 3, rule: s.r5a ?? "" };
    if (count("red") === 1 && count("yellow") > 1)
      return { index: 0, rule: s.r5b ?? "" };
    if (count("black") === 0)
      return { index: 1, rule: s.r5c ?? "" };
    return { index: 0, rule: s.r5d ?? "" };
  }

  // n === 6
  if (count("yellow") === 0 && serialOdd)
    return { index: 2, rule: s.r6a ?? "" };
  if (count("yellow") === 1 && count("white") > 1)
    return { index: 3, rule: s.r6b ?? "" };
  if (count("red") === 0)
    return { index: 5, rule: s.r6c ?? "" };
  return { index: 3, rule: s.r6d ?? "" };
}

/** Czy przy tych kablach parzystość seriala w ogóle wpływa na decyzję? */
function needsSerialParity(wires: WireColor[]): boolean {
  const n = wires.length;
  if (n < 3 || n > 6) return false;
  const count = (c: WireColor) => wires.filter((w) => w === c).length;
  if (n === 3) return false;
  if (n === 4) return count("red") > 1;
  if (n === 5) return wires[n - 1] === "black";
  return count("yellow") === 0; // n === 6
}

export default function WireHorizontal() {
  const serialLastDigitEven = useAppStore((s) => s.bombFacts.serialLastDigitEven);
  const s = useAppStore((s) => s.t.ui.wires) as WireStrings;

  const [wires, setWires] = React.useState<WireColor[]>([]);

  const reset = () => setWires([]);
  const addWire = (c: WireColor) =>
    setWires((prev) => (prev.length >= 6 ? prev : [...prev, c]));
  const undoLast = () => setWires((prev) => prev.slice(0, -1));

  const needsSerial = needsSerialParity(wires);
  const serialKnown = serialLastDigitEven !== null;

  const solution: Solution | null = React.useMemo(() => {
    if (wires.length < 3 || wires.length > 6) return null;
    if (needsSerialParity(wires) && serialLastDigitEven === null) return null;
    return solveWires(wires, !serialLastDigitEven, s);
  }, [wires, serialLastDigitEven, s]);

  const parityWord =
    serialLastDigitEven === null ? "?" : serialLastDigitEven ? (s.parityEven ?? "") : (s.parityOdd ?? "");

  return (
    <Box sx={{ userSelect: "none" }}>
      <ModuleHeader
        title={s.title ?? "Wires"}
        onReset={reset}
        requiredData={[fmt(s.reqParity ?? "{v}", { v: parityWord })]}
        helpText={s.help}
      />

      {needsSerial && !serialKnown && <MissingFactsBanner needed={["serialLastDigitEven"]} />}

      {/* 5 guzików — kolory kabli */}
      <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
        {fmt(s.clickColors ?? "", { n: wires.length })}
      </Typography>
      <Box sx={{ display: "flex", gap: 1.5, mb: 1, flexWrap: "wrap" }}>
        {ALL_COLORS.map((c) => (
          <Button
            key={c}
            onClick={() => addWire(c)}
            disabled={wires.length >= 6}
            title={colorName(c, s)}
            sx={{
              minWidth: 96,
              height: 56,
              bgcolor: COLOR_BG[c],
              color: c === "yellow" || c === "white" ? "#111" : "#fff",
              border: "2px solid rgba(0,0,0,0.4)",
              borderRadius: 2,
              fontWeight: 800,
              "&:hover": { bgcolor: COLOR_BG[c], opacity: 0.88 },
              "&.Mui-disabled": { opacity: 0.5, color: c === "yellow" || c === "white" ? "#111" : "#fff" },
            }}
          >
            {colorName(c, s)}
          </Button>
        ))}
      </Box>
      <Box sx={{ display: "flex", gap: 1, mb: 2, alignItems: "center" }}>
        <Button
          size="small"
          variant="outlined"
          startIcon={<UndoIcon />}
          onClick={undoLast}
          disabled={wires.length === 0}
        >
          {s.undo ?? ""}
        </Button>
        <Typography variant="caption" sx={{ opacity: 0.6 }}>
          {s.hint36 ?? ""}
        </Typography>
      </Box>

      <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap", alignItems: "flex-start" }}>
        {/* Kable od góry */}
        <Paper elevation={2} sx={{ p: 2, minWidth: 320, maxWidth: 420, flex: "0 1 auto" }}>
          {wires.length === 0 && (
            <Typography variant="body2" sx={{ opacity: 0.6 }}>
              {s.emptyState ?? ""}
            </Typography>
          )}
          {wires.map((w, idx) => {
            const isTarget = solution?.index === idx;
            return (
              <Box
                key={`${w}-${idx}`}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 1,
                  p: isTarget ? 0.75 : 1,
                  borderRadius: 1,
                  border: isTarget ? "3px solid #2e7d32" : "1px solid rgba(0,0,0,0.15)",
                  bgcolor: isTarget ? "rgba(76,175,80,0.14)" : "transparent",
                }}
              >
                <Typography variant="body1" sx={{ fontWeight: 800, minWidth: 24 }}>
                  {idx + 1}.
                </Typography>
                {/* rysunek kabla */}
                <Box
                  sx={{
                    flex: 1,
                    height: 22,
                    borderRadius: 11,
                    bgcolor: COLOR_BG[w],
                    border: "2px solid rgba(0,0,0,0.45)",
                    boxShadow: "inset 0 -3px 0 rgba(0,0,0,0.25)",
                  }}
                  title={colorName(w, s)}
                />
                <Box sx={{ width: 40, display: "flex", justifyContent: "center" }}>
                  {isTarget && <ContentCutIcon color="success" fontSize="medium" />}
                </Box>
              </Box>
            );
          })}
          {wires.length > 0 && wires.length < 3 && (
            <Typography variant="body2" sx={{ mt: 1, opacity: 0.7 }}>
              {fmt(s.needMore ?? "", { n: 3 - wires.length })}
            </Typography>
          )}
        </Paper>

        {/* Wynik */}
        <Box sx={{ minWidth: 280, maxWidth: 440, flex: 1 }}>
          {needsSerial && !serialKnown ? (
            <Alert severity="warning" sx={{ border: "3px solid #ed6c02" }}>
              <AlertTitle sx={{ fontWeight: 900, fontSize: 18 }}>
                {s.blockedTitle ?? ""}
              </AlertTitle>
              <Typography variant="body1" sx={{ fontWeight: 800, color: "error.main" }}>
                {s.blockedDesc ?? ""}
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {fmt(s.blockedReason ?? "", { n: wires.length })}
              </Typography>
            </Alert>
          ) : solution ? (
            <Alert severity="success">
              <AlertTitle sx={{ fontWeight: 800, fontSize: 18 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <ContentCutIcon />
                  {fmt(s.cutWire ?? "", { n: solution.index + 1 })}
                </Box>
              </AlertTitle>
              <Typography variant="body2">{solution.rule}</Typography>
              <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
                {fmt(s.colorsFromTop ?? "", { list: wires.map((w) => colorName(w, s)).join(" → ") })}
              </Typography>
            </Alert>
          ) : (
            <Alert severity="info">
              {wires.length > 6
                ? (s.tooMany ?? "")
                : fmt(s.notEnough ?? "", { n: wires.length })}
            </Alert>
          )}
          <Typography variant="caption" sx={{ opacity: 0.6, mt: 1, display: "block" }}>
            {s.note ?? ""}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
