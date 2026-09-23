import * as React from "react";
import { Alert, AlertTitle, Box, Button, Paper, Typography } from "@mui/material";
import { fmt, useAppStore, type FactKey } from "../store/AppStore";
import ModuleHeader from "../components/ModuleHeader";
import MissingFactsBanner from "../components/MissingFactsBanner";

type BtnColor = "blue" | "red" | "white" | "yellow";
type BtnLabel = "ABORT" | "DETONATE" | "HOLD" | "PRESS";
type StripColor = "blue" | "yellow" | "other";

const COLOR_BG: Record<BtnColor, string> = {
  blue: "#1976d2",
  red: "#d32f2f",
  white: "#f5f5f5",
  yellow: "#fbc02d",
};

const FALLBACK_LABELS: Record<BtnLabel, string> = {
  ABORT: "ABORT",
  DETONATE: "DETONATE",
  HOLD: "HOLD",
  PRESS: "PRESS",
};

const STRIP_DIGIT: Record<StripColor, string> = {
  blue: "4",
  yellow: "5",
  other: "1",
};

interface Facts {
  batteryCount: number | null;
  indicatorCAR: boolean | null;
  indicatorFRK: boolean | null;
}

type EvalResult =
  | { status: "needSelection" }
  | { status: "need"; needed: FactKey[]; atRule: number; reason: string }
  | { status: "tap"; rule: number; desc: string }
  | { status: "hold"; rule: number; desc: string };

/**
 * Reguły z manuala, po kolei. Zwraca TAP / HOLD albo listę faktów,
 * które trzeba wpisać żeby rozstrzygnąć (jak w innych modułach).
 * 1. niebieski + ABORT → HOLD
 * 2. >1 baterii + DETONATE → TAP
 * 3. biały + świecący CAR → HOLD
 * 4. >2 baterii + świecący FRK → TAP
 * 5. żółty → HOLD
 * 6. czerwony + HOLD → TAP
 * 7. inaczej → HOLD
 */
type BtnStrings = Record<string, string>;

function evaluate(
  color: BtnColor,
  label: BtnLabel,
  facts: Facts,
  disp: Record<BtnLabel, string>,
  b: BtnStrings
): EvalResult {
  const hold = b.actHold ?? "";
  const tap = b.actTap ?? "";
  const colorWord =
    color === "blue" ? (b.colorBlue ?? "")
    : color === "red" ? (b.colorRed ?? "")
    : color === "white" ? (b.colorWhite ?? "")
    : (b.colorYellow ?? "");
  // 1. niebieski + ABORT (bez faktów)
  if (color === "blue" && label === "ABORT")
    return { status: "hold", rule: 1, desc: fmt(b.d1 ?? "", { c: colorWord, l: disp.ABORT, a: hold }) };

  // 2. DETONATE + >1 baterii
  if (label === "DETONATE") {
    if (facts.batteryCount === null)
      return {
        status: "need",
        needed: ["batteryCount"],
        atRule: 2,
        reason: fmt(b.reason2 ?? "", { l: disp.DETONATE }),
      };
    if (facts.batteryCount >= 2)
      return { status: "tap", rule: 2, desc: fmt(b.d2 ?? "", { l: disp.DETONATE, a: tap }) };
    // ≤1 baterii → leć dalej
  }

  // 3. biały + CAR
  if (color === "white") {
    if (facts.indicatorCAR === null)
      return {
        status: "need",
        needed: ["indicatorCAR"],
        atRule: 3,
        reason: b.reason3 ?? "",
      };
    if (facts.indicatorCAR)
      return { status: "hold", rule: 3, desc: fmt(b.d3 ?? "", { c: colorWord, a: hold }) };
  }

  // 4. >2 baterii + FRK
  {
    const needBatt = facts.batteryCount === null;
    const needFrk = facts.indicatorFRK === null;
    if (needBatt || needFrk) {
      const needed: FactKey[] = [];
      if (needBatt) needed.push("batteryCount");
      if (needFrk) needed.push("indicatorFRK");
      return {
        status: "need",
        needed,
        atRule: 4,
        reason: b.reason4 ?? "",
      };
    }
    if (facts.batteryCount === 3 && facts.indicatorFRK)
      return { status: "tap", rule: 4, desc: fmt(b.d4 ?? "", { a: tap }) };
  }

  // 5. żółty
  if (color === "yellow")
    return { status: "hold", rule: 5, desc: fmt(b.d5 ?? "", { c: colorWord, a: hold }) };

  // 6. czerwony + HOLD
  if (color === "red" && label === "HOLD")
    return { status: "tap", rule: 6, desc: fmt(b.d6 ?? "", { c: colorWord, l: disp.HOLD, a: tap }) };

  // 7. inaczej
  return { status: "hold", rule: 7, desc: fmt(b.d7 ?? "", { a: hold }) };
}

export default function BigButton() {
  const t = useAppStore((s) => s.t);
  const rawLabels = t?.bigButtonLabels as Record<string, string> | undefined;
  const disp: Record<BtnLabel, string> = {
    ABORT: rawLabels?.ABORT || FALLBACK_LABELS.ABORT,
    DETONATE: rawLabels?.DETONATE || FALLBACK_LABELS.DETONATE,
    HOLD: rawLabels?.HOLD || FALLBACK_LABELS.HOLD,
    PRESS: rawLabels?.PRESS || FALLBACK_LABELS.PRESS,
  };

  const batteryCount = useAppStore((s) => s.bombFacts.batteryCount);
  const indicatorCAR = useAppStore((s) => s.bombFacts.indicatorCAR);
  const indicatorFRK = useAppStore((s) => s.bombFacts.indicatorFRK);
  const bombFactsFull = useAppStore((s) => s.bombFacts);
  const b = (useAppStore((s) => s.t?.ui?.button) ?? {}) as BtnStrings;
  const uiFacts = (useAppStore((s) => s.t?.ui?.facts) ?? {}) as Record<string, string>;

  const [color, setColor] = React.useState<BtnColor | null>(null);
  const [label, setLabel] = React.useState<BtnLabel | null>(null);
  const [strip, setStrip] = React.useState<StripColor | null>(null);

  const reset = () => {
    setColor(null);
    setLabel(null);
    setStrip(null);
  };

  const result: EvalResult = React.useMemo(() => {
    if (!color || !label) return { status: "needSelection" };
    return evaluate(color, label, { batteryCount, indicatorCAR, indicatorFRK }, disp, b);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [color, label, batteryCount, indicatorCAR, indicatorFRK, t]);

  const neededBanner: FactKey[] =
    result.status === "need" ? result.needed.filter((k) => bombFactsFull[k] === null) : [];

  const fmtBatt = batteryCount === null ? "?" : batteryCount === 3 ? "3+" : String(batteryCount);
  const fmtTri = (v: boolean | null, t: string, f: string) => (v === null ? "?" : v ? t : f);
  const factLabelOf = (k: FactKey) =>
    k === "batteryCount" ? (uiFacts.labelBatteries ?? k)
    : k === "indicatorCAR" ? (uiFacts.labelCar ?? k)
    : k === "indicatorFRK" ? (uiFacts.labelFrk ?? k)
    : k === "serialLastDigitEven" ? (uiFacts.labelSerialEven ?? k)
    : (uiFacts.labelVowel ?? k);

  const colorWord = (c: BtnColor) =>
    c === "blue" ? (b.colorBlue ?? c)
    : c === "red" ? (b.colorRed ?? c)
    : c === "white" ? (b.colorWhite ?? c)
    : (b.colorYellow ?? c);

  return (
    <Box sx={{ userSelect: "none" }}>
      <ModuleHeader
        title={b.title ?? "Button"}
        onReset={reset}
        requiredData={[
          `${b.reqBatt ?? ""}: ${fmtBatt}`,
          `${b.reqCar ?? ""}: ${fmtTri(indicatorCAR, b.valYes ?? "", b.valNo ?? "")}`,
          `${b.reqFrk ?? ""}: ${fmtTri(indicatorFRK, b.valYes ?? "", b.valNo ?? "")}`,
        ]}
        helpText={b.help}
      />

      {neededBanner.length > 0 && <MissingFactsBanner needed={neededBanner} />}

      {/* 1) kolor */}
      <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
        {b.secColor ?? ""}
      </Typography>
      <Box sx={{ display: "flex", gap: 1.5, mb: 2, flexWrap: "wrap" }}>
        {(["blue", "red", "white", "yellow"] as BtnColor[]).map((c) => (
          <Button
            key={c}
            onClick={() => setColor(c)}
            sx={{
              minWidth: 110,
              height: 56,
              bgcolor: COLOR_BG[c],
              color: c === "white" || c === "yellow" ? "#111" : "#fff",
              border: color === c ? "4px solid #111" : "2px solid rgba(0,0,0,0.4)",
              borderRadius: 2,
              fontWeight: 800,
              "&:hover": { bgcolor: COLOR_BG[c], opacity: 0.88 },
            }}
          >
            {colorWord(c)}
          </Button>
        ))}
      </Box>

      {/* 2) napis */}
      <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
        {b.secLabel ?? ""}
      </Typography>
      <Box sx={{ display: "flex", gap: 1.5, mb: 2, flexWrap: "wrap" }}>
        {(["ABORT", "DETONATE", "HOLD", "PRESS"] as BtnLabel[]).map((l) => (
          <Button
            key={l}
            variant={label === l ? "contained" : "outlined"}
            color={label === l ? "success" : "inherit"}
            onClick={() => setLabel(l)}
            sx={{ minWidth: 130, height: 48, fontWeight: 800 }}
          >
            {disp[l]}
          </Button>
        ))}
      </Box>

      <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap", alignItems: "flex-start" }}>
        <Box sx={{ minWidth: 280, maxWidth: 520, flex: 1 }}>
          {result.status === "needSelection" && (
            <Alert severity="info">
              {b.needSelection ?? ""}
            </Alert>
          )}

          {result.status === "need" && (
            <Alert severity="warning" sx={{ border: "3px solid #ed6c02" }}>
              <AlertTitle sx={{ fontWeight: 900, fontSize: 18 }}>
                {fmt(b.blockedTitle ?? "", {
                  list: result.needed.map(factLabelOf).join(" • "),
                })}
              </AlertTitle>
              <Typography variant="body1" sx={{ fontWeight: 800, color: "error.main" }}>
                {b.blockedDesc ?? ""}
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {fmt(b.blockedRule ?? "", { n: result.atRule, r: result.reason })}
              </Typography>
            </Alert>
          )}

          {result.status === "tap" && (
            <Alert severity="success">
              <AlertTitle sx={{ fontWeight: 900, fontSize: 20 }}>
                {b.tapTitle ?? ""}
              </AlertTitle>
              <Typography variant="body2">
                {b.ruleWord ?? ""} {result.rule}: {result.desc}.
              </Typography>
            </Alert>
          )}

          {result.status === "hold" && (
            <Alert severity="success" sx={{ mb: 2 }}>
              <AlertTitle sx={{ fontWeight: 900, fontSize: 20 }}>
                {b.holdTitle ?? ""}
              </AlertTitle>
              <Typography variant="body2">
                {b.ruleWord ?? ""} {result.rule}: {result.desc}. {b.stripPrompt ?? ""}
              </Typography>
              <Box sx={{ display: "flex", gap: 1, mt: 1.5, flexWrap: "wrap" }}>
                {(
                  [
                    { v: "blue" as StripColor, label: b.stripBlue ?? "" },
                    { v: "yellow" as StripColor, label: b.stripYellow ?? "" },
                    { v: "other" as StripColor, label: b.stripOther ?? "" },
                  ]
                ).map((o) => (
                  <Button
                    key={o.v}
                    variant={strip === o.v ? "contained" : "outlined"}
                    color={strip === o.v ? "success" : "inherit"}
                    size="small"
                    onClick={() => setStrip(o.v)}
                    sx={{ fontWeight: 800 }}
                  >
                    {o.label}
                  </Button>
                ))}
              </Box>
              {strip && (
                <Paper elevation={0} sx={{ mt: 1.5, p: 1.5, bgcolor: "rgba(46,125,50,0.12)" }}>
                  <Typography variant="h5" sx={{ fontWeight: 900 }}>
                    {fmt(b.releaseTitle ?? "", { d: STRIP_DIGIT[strip] })}
                  </Typography>
                  <Typography variant="body2">
                    {fmt(b.releaseSub ?? "", { d: STRIP_DIGIT[strip] })}
                  </Typography>
                </Paper>
              )}
            </Alert>
          )}
        </Box>
      </Box>
    </Box>
  );
}
