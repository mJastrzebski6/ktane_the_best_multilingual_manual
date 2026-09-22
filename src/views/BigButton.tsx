import * as React from "react";
import { Alert, AlertTitle, Box, Button, Paper, Typography } from "@mui/material";
import { FACT_LABELS, useAppStore, type FactKey } from "../store/AppStore";
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
function evaluate(
  color: BtnColor,
  label: BtnLabel,
  facts: Facts,
  disp: Record<BtnLabel, string>
): EvalResult {
  // 1. niebieski + ABORT (bez faktów)
  if (color === "blue" && label === "ABORT")
    return { status: "hold", rule: 1, desc: `niebieski + ${disp.ABORT} → PRZYTRZYMAJ` };

  // 2. DETONATE + >1 baterii
  if (label === "DETONATE") {
    if (facts.batteryCount === null)
      return {
        status: "need",
        needed: ["batteryCount"],
        atRule: 2,
        reason: `napis ${disp.DETONATE} — reguła 2 sprawdza czy baterii jest > 1`,
      };
    if (facts.batteryCount >= 2)
      return { status: "tap", rule: 2, desc: `${disp.DETONATE} + >1 baterii → NACIŚNIJ I PUŚĆ` };
    // ≤1 baterii → leć dalej
  }

  // 3. biały + CAR
  if (color === "white") {
    if (facts.indicatorCAR === null)
      return {
        status: "need",
        needed: ["indicatorCAR"],
        atRule: 3,
        reason: "biały guzik — reguła 3 sprawdza czy CAR się świeci",
      };
    if (facts.indicatorCAR)
      return { status: "hold", rule: 3, desc: "biały + świecący CAR → PRZYTRZYMAJ" };
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
        reason: "reguła 4 sprawdza czy baterii jest > 2 i FRK się świeci",
      };
    }
    if (facts.batteryCount === 3 && facts.indicatorFRK)
      return { status: "tap", rule: 4, desc: ">2 baterii + świecący FRK → NACIŚNIJ I PUŚĆ" };
  }

  // 5. żółty
  if (color === "yellow")
    return { status: "hold", rule: 5, desc: "żółty → PRZYTRZYMAJ" };

  // 6. czerwony + HOLD
  if (color === "red" && label === "HOLD")
    return { status: "tap", rule: 6, desc: `czerwony + ${disp.HOLD} → NACIŚNIJ I PUŚĆ` };

  // 7. inaczej
  return { status: "hold", rule: 7, desc: "żadna reguła 1–6 → PRZYTRZYMAJ" };
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
    return evaluate(color, label, { batteryCount, indicatorCAR, indicatorFRK }, disp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [color, label, batteryCount, indicatorCAR, indicatorFRK, t]);

  const neededBanner: FactKey[] =
    result.status === "need" ? result.needed.filter((k) => bombFactsFull[k] === null) : [];

  const fmtBatt = batteryCount === null ? "?" : batteryCount === 3 ? "3+" : String(batteryCount);
  const fmtTri = (v: boolean | null, t: string, f: string) => (v === null ? "?" : v ? t : f);

  return (
    <Box sx={{ userSelect: "none" }}>
      <ModuleHeader
        title="Button / Wielki guzik"
        onReset={reset}
        requiredData={[
          `BATERIE: ${fmtBatt}`,
          `CAR: ${fmtTri(indicatorCAR, "świeci", "nie")}`,
          `FRK: ${fmtTri(indicatorFRK, "świeci", "nie")}`,
        ]}
        helpText="Kliknij kolor guzika i napis z bomby. Program idzie po regułach 1–7 i mówi NACIŚNIJ albo PRZYTRZYMAJ. Przy HOLD wybierz kolor paska po przytrzymaniu żeby dostać cyfrę do puszczenia."
      />

      {neededBanner.length > 0 && <MissingFactsBanner needed={neededBanner} />}

      {/* 1) kolor */}
      <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
        1) Kolor guzika:
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
            {c === "blue" ? "niebieski" : c === "red" ? "czerwony" : c === "white" ? "biały" : "żółty"}
          </Button>
        ))}
      </Box>

      {/* 2) napis */}
      <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
        2) Napis na guziku:
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
              Wybierz kolor i napis powyżej — wynik pojawi się sam.
            </Alert>
          )}

          {result.status === "need" && (
            <Alert severity="warning" sx={{ border: "3px solid #ed6c02" }}>
              <AlertTitle sx={{ fontWeight: 900, fontSize: 18 }}>
                NAJPIERW WPISZ POWYŻEJ: {result.needed.map((k) => FACT_LABELS[k]).join(" • ")}
              </AlertTitle>
              <Typography variant="body1" sx={{ fontWeight: 800, color: "error.main" }}>
                Bez tego wynik jest nieznany — nie wiadomo NACIŚNIJ czy PRZYTRZYMAJ.
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                Reguła {result.atRule}: {result.reason}. Uzupełnij w banerze powyżej albo w lewym panelu.
              </Typography>
            </Alert>
          )}

          {result.status === "tap" && (
            <Alert severity="success">
              <AlertTitle sx={{ fontWeight: 900, fontSize: 20 }}>
                NACIŚNIJ I OD RAZU PUŚĆ
              </AlertTitle>
              <Typography variant="body2">
                Reguła {result.rule}: {result.desc}.
              </Typography>
            </Alert>
          )}

          {result.status === "hold" && (
            <Alert severity="success" sx={{ mb: 2 }}>
              <AlertTitle sx={{ fontWeight: 900, fontSize: 20 }}>
                PRZYTRZYMAJ GUZIK
              </AlertTitle>
              <Typography variant="body2">
                Reguła {result.rule}: {result.desc}. Po przytrzymaniu zapali się pasek —
                kliknij jego kolor:
              </Typography>
              <Box sx={{ display: "flex", gap: 1, mt: 1.5, flexWrap: "wrap" }}>
                {(
                  [
                    { v: "blue" as StripColor, label: "niebieski pasek → 4" },
                    { v: "yellow" as StripColor, label: "żółty pasek → 5" },
                    { v: "other" as StripColor, label: "inny (biały/czerwony/…) → 1" },
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
                    PUŚĆ GDY NA LICZNIKU JEST {STRIP_DIGIT[strip]}
                  </Typography>
                  <Typography variant="body2">
                    (cyfra {STRIP_DIGIT[strip]} gdziekolwiek na timerze)
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
