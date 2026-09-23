import * as React from "react";
import { Alert, AlertTitle, Box, Button, Typography } from "@mui/material";
import { fmt, useAppStore, type FactKey } from "../store/AppStore";
import ModuleHeader from "../components/ModuleHeader";
import MissingFactsBanner from "../components/MissingFactsBanner";

type WireColor = "white" | "red" | "blue" | "redBlue";

type WireState = {
  ledOn: boolean;
  star: boolean;
  color: WireColor;
};

type Decision = "CUT" | "DONT" | "B" | "P" | "S";

const DEFAULT_WIRE: WireState = {
  ledOn: false,
  star: false,
  color: "white",
};

const createDefaultWires = () =>
  Array.from({ length: 6 }, () => ({ ...DEFAULT_WIRE })) as WireState[];

const TABLE: Record<WireColor, [Decision, Decision, Decision, Decision]> = {
  white: ["CUT", "CUT", "DONT", "B"],
  red: ["S", "CUT", "B", "B"],
  blue: ["S", "DONT", "P", "P"],
  redBlue: ["S", "P", "S", "DONT"],
};

function getTableColumnIndex(ledOn: boolean, star: boolean): 0 | 1 | 2 | 3 {
  if (!ledOn && !star) return 0;
  if (!ledOn && star) return 1;
  if (ledOn && !star) return 2;
  return 3;
}

function shouldCut(
  wire: WireState,
  bombFacts: {
    hasParallelPort: boolean | null;
    batteryCount: number | null;
    serialLastDigitEven: boolean | null;
  }
): boolean | null {
  const col = getTableColumnIndex(wire.ledOn, wire.star);
  const decision = TABLE[wire.color][col];

  switch (decision) {
    case "CUT":
      return true;
    case "DONT":
      return false;
    case "B":
      if (bombFacts.batteryCount === null) return null;
      return bombFacts.batteryCount >= 2;
    case "P":
      if (bombFacts.hasParallelPort === null) return null;
      return bombFacts.hasParallelPort;
    case "S":
      if (bombFacts.serialLastDigitEven === null) return null;
      return bombFacts.serialLastDigitEven;
  }
}

/** Którego faktu wymaga dany kabel (jeśli w ogóle)? */
function neededFactFor(wire: WireState): FactKey | null {
  const col = getTableColumnIndex(wire.ledOn, wire.star);
  const decision = TABLE[wire.color][col];
  if (decision === "B") return "batteryCount";
  if (decision === "P") return "hasParallelPort";
  if (decision === "S") return "serialLastDigitEven";
  return null;
}

const FACT_TO_LABEL_KEY: Record<FactKey, string> = {
  serialLastDigitEven: "labelSerialEven",
  serialHasVowel: "labelVowel",
  indicatorCAR: "labelCar",
  indicatorFRK: "labelFrk",
  hasParallelPort: "labelParallel",
  batteryCount: "labelBatteries",
};

function colorButtonSx(color: WireColor) {
  const base = {
    minWidth: 44,
    height: 44,
    borderRadius: 1.5,
    border: "1px solid rgba(0,0,0,0.25)",
    p: 0,
    lineHeight: 1,
  } as const;

  switch (color) {
    case "white":
      return { ...base, bgcolor: "#fff" };
    case "red":
      return { ...base, bgcolor: "#d50000", color: "#fff" };
    case "blue":
      return { ...base, bgcolor: "#1e3a8a", color: "#fff" };
    case "redBlue":
      return {
        ...base,
        color: "#fff",
        background:
          "linear-gradient(135deg, #d50000 0%, #d50000 50%, #1e3a8a 50%, #1e3a8a 100%)",
      };
  }
}

function selectableSx(selected: boolean) {
  return selected
    ? {
        outline: "3px solid rgba(0,0,0,0.65)",
        outlineOffset: "1px",
      }
    : {};
}

export default function WireVertical() {
  const hasParallelPort = useAppStore((s) => s.bombFacts.hasParallelPort);
  const batteryCount = useAppStore((s) => s.bombFacts.batteryCount);
  const serialLastDigitEven = useAppStore(
    (s) => s.bombFacts.serialLastDigitEven
  );
  const bombFactsFull = useAppStore((s) => s.bombFacts);
  const s = (useAppStore((s) => s.t?.ui?.venn) ?? {}) as Record<string, string>;
  const uiFacts = (useAppStore((s) => s.t?.ui?.facts) ?? {}) as Record<string, string>;

  const bombFacts = React.useMemo(
    () => ({ hasParallelPort, batteryCount, serialLastDigitEven }),
    [hasParallelPort, batteryCount, serialLastDigitEven]
  );

  const [wires, setWires] = React.useState<WireState[]>(createDefaultWires);

  // Fakty realnie potrzebne przez AKTUALNIE ustawione kable (a nie "wszystkie z manuala")
  const neededFacts = React.useMemo(() => {
    const set = new Set<FactKey>();
    for (const w of wires) {
      const f = neededFactFor(w);
      if (f) set.add(f);
    }
    return [...set];
  }, [wires]);

  const missingFacts = neededFacts.filter((k) => bombFactsFull[k] === null);
  const undecidedCount = wires.filter((w) => shouldCut(w, bombFacts) === null).length;
  const factLabelOf = (k: FactKey) => uiFacts[FACT_TO_LABEL_KEY[k]] ?? k;

  const fmtTri = (v: boolean | null, t: string, f: string) =>
    v === null ? "?" : v ? t : f;

  const battWord = batteryCount === null ? "?" : batteryCount === 3 ? (s.valMany ?? "3+") : String(batteryCount);

  const resetWires = React.useCallback(() => {
    setWires(createDefaultWires());
  }, []);

  const setWire = React.useCallback(
    (idx: number, patch: Partial<WireState>) => {
      setWires((prev) => {
        const next = [...prev];
        next[idx] = { ...next[idx], ...patch };
        return next;
      });
    },
    []
  );

  return (
    <>
      <ModuleHeader
        title={s.title ?? "VENN"}
        onReset={resetWires}
        requiredData={[
          `${s.reqBatteries ?? ""}: ${battWord}`,
          `${s.reqPort ?? ""}: ${fmtTri(hasParallelPort, s.valPresent ?? "", s.valAbsent ?? "")}`,
          `${s.reqSerial ?? ""}: ${fmtTri(serialLastDigitEven, s.valEven ?? "", s.valOdd ?? "")}`,
        ]}
        helpText={s.help}
      />

      <MissingFactsBanner needed={neededFacts} />
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(6, 64px)",
          gridTemplateRows: "56px 12px 56px 56px 56px 56px 12px 56px 12px 56px",
          gap: 1,
          alignItems: "center",
          justifyContent: "flex-start",
          ml: 2,
        }}
      >
        {/* Rząd 1: LED toggle */}
        {wires.map((w, colIdx) => {
          const isOn = w.ledOn;
          return (
            <Box
              key={`led-${colIdx}`}
              sx={{ display: "flex", justifyContent: "center" }}
            >
              <Button
                variant="outlined"
                onClick={() => setWire(colIdx, { ledOn: !w.ledOn })}
                sx={{
                  minWidth: 44,
                  height: 44,
                  borderRadius: "999px",
                  border: "2px solid rgba(0,0,0,0.45)",
                  bgcolor: isOn ? "#ffeb3b" : "transparent",
                }}
              >
                {isOn ? "●" : "○"}
              </Button>
            </Box>
          );
        })}

        <Box
          sx={{ gridColumn: "1 / -1", display: "flex", alignItems: "center" }}
        >
          <Box
            sx={{ width: "100%", borderBottom: "3px solid rgba(0,0,0,0.6)" }}
          />
        </Box>

        {/* Rząd 2: white */}
        {wires.map((w, colIdx) => (
          <Box
            key={`white-${colIdx}`}
            sx={{ display: "flex", justifyContent: "center" }}
          >
            <Button
              onClick={() => setWire(colIdx, { color: "white" })}
              sx={{
                ...colorButtonSx("white"),
                ...selectableSx(w.color === "white"),
              }}
            />
          </Box>
        ))}

        {/* Rząd 3: red */}
        {wires.map((w, colIdx) => (
          <Box
            key={`red-${colIdx}`}
            sx={{ display: "flex", justifyContent: "center" }}
          >
            <Button
              onClick={() => setWire(colIdx, { color: "red" })}
              sx={{
                ...colorButtonSx("red"),
                ...selectableSx(w.color === "red"),
              }}
            />
          </Box>
        ))}

        {/* Rząd 4: blue */}
        {wires.map((w, colIdx) => (
          <Box
            key={`blue-${colIdx}`}
            sx={{ display: "flex", justifyContent: "center" }}
          >
            <Button
              onClick={() => setWire(colIdx, { color: "blue" })}
              sx={{
                ...colorButtonSx("blue"),
                ...selectableSx(w.color === "blue"),
              }}
            />
          </Box>
        ))}

        {/* Rząd 5: red+blue */}
        {wires.map((w, colIdx) => (
          <Box
            key={`rb-${colIdx}`}
            sx={{ display: "flex", justifyContent: "center" }}
          >
            <Button
              onClick={() => setWire(colIdx, { color: "redBlue" })}
              sx={{
                ...colorButtonSx("redBlue"),
                ...selectableSx(w.color === "redBlue"),
              }}
            />
          </Box>
        ))}

        <Box
          sx={{ gridColumn: "1 / -1", display: "flex", alignItems: "center" }}
        >
          <Box
            sx={{ width: "100%", borderBottom: "3px solid rgba(0,0,0,0.6)" }}
          />
        </Box>

        {/* Rząd 6: star toggle */}
        {wires.map((w, colIdx) => (
          <Box
            key={`star-${colIdx}`}
            sx={{ display: "flex", justifyContent: "center" }}
          >
            <Button
              variant="outlined"
              onClick={() => setWire(colIdx, { star: !w.star })}
              sx={{
                minWidth: 44,
                height: 44,
                borderRadius: 1.5,
                border: "1px solid rgba(0,0,0,0.25)",
                fontSize: 22,
              }}
            >
              {w.star ? "★" : ""}
            </Button>
          </Box>
        ))}

        <Box
          sx={{ gridColumn: "1 / -1", display: "flex", alignItems: "center" }}
        >
          <Box
            sx={{ width: "100%", borderBottom: "3px solid rgba(255,0,0,1)" }}
          />
        </Box>

        {/* Rząd 7: wynik */}
        {wires.map((w, colIdx) => {
          const cut = shouldCut(w, bombFacts);
          return (
            <Box
              key={`result-${colIdx}`}
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: 26,
                userSelect: "none",
              }}
              title={cut === null ? (s.tipMissing ?? "") : cut ? (s.tipCut ?? "") : (s.tipLeave ?? "")}
            >
              {cut === null ? "❔" : cut ? "✅" : "❌"}
            </Box>
          );
        })}
      </Box>

      {/* Blokada wyniku jak w Simonie — dużymi literami, analogicznie */}
      {missingFacts.length > 0 && (
        <Alert severity="warning" sx={{ mt: 2, border: "3px solid #ed6c02" }}>
          <AlertTitle sx={{ fontWeight: 900, fontSize: 18 }}>
            {fmt(s.blockedTitle ?? "", {
              list: missingFacts.map((k) => factLabelOf(k)).join(" • "),
            })}
          </AlertTitle>
          <Typography variant="body1" sx={{ fontWeight: 800, color: "error.main" }}>
            {fmt(s.blockedDesc ?? "", {
              n: undecidedCount,
              word: undecidedCount === 1 ? (s.blockedCableOne ?? "") : (s.blockedCableMany ?? ""),
              tail: s.blockedTail ?? "",
            })}
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            {s.blockedNote ?? ""}
          </Typography>
        </Alert>
      )}
    </>
  );
}
