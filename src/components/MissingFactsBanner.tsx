import { Alert, AlertTitle, Box, Button, Typography } from "@mui/material";
import { FACT_LABELS, useAppStore, type FactKey } from "../store/AppStore";

function BoolQuickSet({ factKey }: { factKey: FactKey }) {
  const value = useAppStore((s) => s.bombFacts[factKey]);
  const setBombFacts = useAppStore((s) => s.setBombFacts);

  // Etykiety przycisków dopasowane do faktu
  const opts: { label: string; value: boolean }[] =
    factKey === "serialLastDigitEven"
      ? [
          { label: "PARZYSTA", value: true },
          { label: "NIEPARZYSTA", value: false },
        ]
      : factKey === "serialHasVowel"
        ? [
            { label: "JEST SAMOGŁOSKA", value: true },
            { label: "BRAK SAMOGŁOSKI", value: false },
          ]
        : factKey === "hasParallelPort"
          ? [
              { label: "JEST PORT", value: true },
              { label: "BRAK PORTU", value: false },
            ]
          : [
              { label: "ŚWIECI (TAK)", value: true },
              { label: "NIE ŚWIECI", value: false },
            ];

  return (
    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
      {opts.map((o) => (
        <Button
          key={o.label}
          variant={value === o.value ? "contained" : "outlined"}
          color={value === o.value ? "success" : "inherit"}
          size="small"
          onClick={() => setBombFacts({ [factKey]: o.value } as never)}
          sx={{ fontWeight: 800 }}
        >
          {o.label}
        </Button>
      ))}
    </Box>
  );
}

function BatteryQuickSet() {
  const batteryCount = useAppStore((s) => s.bombFacts.batteryCount);
  const setBatteryCount = useAppStore((s) => s.setBatteryCount);
  return (
    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
      {(
        [
          { label: "0", value: 0 },
          { label: "1", value: 1 },
          { label: "2", value: 2 },
          { label: "3+", value: 3 },
        ] as const
      ).map((o) => (
        <Button
          key={o.label}
          variant={batteryCount === o.value ? "contained" : "outlined"}
          color={batteryCount === o.value ? "success" : "inherit"}
          size="small"
          onClick={() => setBatteryCount(o.value)}
          sx={{ fontWeight: 800, minWidth: 48 }}
        >
          {o.label}
        </Button>
      ))}
    </Box>
  );
}

/**
 * Duży baner "UZUPEŁNIJ" — pokazuje się TYLKO gdy moduł realnie
 * potrzebuje danego faktu, a ten jest jeszcze "?" (null).
 * Pozwala wpisać brak od razu na miejscu (zapisuje do globalnego store).
 */
export default function MissingFactsBanner({ needed }: { needed: FactKey[] }) {
  const bombFacts = useAppStore((s) => s.bombFacts);
  const missing = needed.filter((k) => bombFacts[k] === null);
  if (missing.length === 0) return null;

  return (
    <Alert severity="warning" sx={{ mb: 2, border: "3px solid #ed6c02" }}>
      <AlertTitle sx={{ fontWeight: 900, fontSize: 20, letterSpacing: 0.5 }}>
        ⚠ UZUPEŁNIJ: {missing.map((k) => FACT_LABELS[k]).join(" • ")}
      </AlertTitle>
      <Typography variant="body2" sx={{ mb: 1.5, fontWeight: 600 }}>
        Ten moduł teraz tego potrzebuje, a w panelu jest jeszcze „?”. Kliknij
        poniżej (zapisze się globalnie):
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        {missing.map((k) => (
          <Box key={k} sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
            <Typography variant="body2" sx={{ fontWeight: 800 }}>
              {FACT_LABELS[k]}:
            </Typography>
            {k === "batteryCount" ? <BatteryQuickSet /> : <BoolQuickSet factKey={k} />}
          </Box>
        ))}
      </Box>
    </Alert>
  );
}
