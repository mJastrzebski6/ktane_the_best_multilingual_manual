import * as React from "react";
import { Box, Button } from "@mui/material";
import { useAppStore } from "../store/AppStore";
import ModuleHeader from "../components/ModuleHeader";

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
    hasParallelPort: boolean;
    batteryCount: number;
    serialLastDigitEven: boolean;
  }
): boolean {
  const col = getTableColumnIndex(wire.ledOn, wire.star);
  const decision = TABLE[wire.color][col];

  switch (decision) {
    case "CUT":
      return true;
    case "DONT":
      return false;
    case "B":
      return bombFacts.batteryCount >= 2;
    case "P":
      return bombFacts.hasParallelPort;
    case "S":
      return bombFacts.serialLastDigitEven;
  }
}

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

  const bombFacts = React.useMemo(
    () => ({ hasParallelPort, batteryCount, serialLastDigitEven }),
    [hasParallelPort, batteryCount, serialLastDigitEven]
  );

  const [wires, setWires] = React.useState<WireState[]>(createDefaultWires);

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
        title="Wires VENN"
        onReset={resetWires}
        requiredData={[
          "BATERIE",
          "PORT RÓWNOLEGŁY",
          "PARZYSTOŚĆ NUMERU SERYJNEGO",
        ]}
      />

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
            >
              {cut ? "✅" : "❌"}
            </Box>
          );
        })}
      </Box>
    </>
  );
}
