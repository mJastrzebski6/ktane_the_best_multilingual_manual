import * as React from "react";
import { Box, Button, Typography, Paper, Alert, AlertTitle } from "@mui/material";
import ContentCutIcon from "@mui/icons-material/ContentCut";
import UndoIcon from "@mui/icons-material/Undo";
import { useAppStore } from "../store/AppStore";
import ModuleHeader from "../components/ModuleHeader";
import MissingFactsBanner from "../components/MissingFactsBanner";

type WireColor = "red" | "blue" | "yellow" | "white" | "black";

const COLOR_PL: Record<WireColor, string> = {
  red: "czerwony",
  blue: "niebieski",
  yellow: "żółty",
  white: "biały",
  black: "czarny",
};

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

function solveWires(wires: WireColor[], serialOdd: boolean): Solution {
  const n = wires.length;
  const count = (c: WireColor) => wires.filter((w) => w === c).length;
  const last = wires[n - 1];
  const lastIndexOf = (c: WireColor) => wires.lastIndexOf(c);

  if (n === 3) {
    if (count("red") === 0)
      return { index: 1, rule: "3 kable: brak czerwonych → przetnij 2. kabel." };
    if (last === "white")
      return { index: 2, rule: "3 kable: ostatni biały → przetnij ostatni." };
    if (count("blue") > 1)
      return {
        index: lastIndexOf("blue"),
        rule: "3 kable: więcej niż 1 niebieski → przetnij ostatni niebieski.",
      };
    return { index: 2, rule: "3 kable: wpp. → przetnij ostatni." };
  }

  if (n === 4) {
    if (count("red") > 1 && serialOdd)
      return {
        index: lastIndexOf("red"),
        rule: "4 kable: >1 czerwony + nieparzysty serial → przetnij ostatni czerwony.",
      };
    if (last === "yellow" && count("red") === 0)
      return { index: 0, rule: "4 kable: ostatni żółty + brak czerwonych → przetnij 1." };
    if (count("blue") === 1)
      return { index: 0, rule: "4 kable: dokładnie 1 niebieski → przetnij 1." };
    if (count("yellow") > 1)
      return { index: 3, rule: "4 kable: więcej niż 1 żółty → przetnij ostatni (4.)." };
    return { index: 1, rule: "4 kable: wpp. → przetnij 2. kabel." };
  }

  if (n === 5) {
    if (last === "black" && serialOdd)
      return { index: 3, rule: "5 kabli: ostatni czarny + nieparzysty serial → przetnij 4." };
    if (count("red") === 1 && count("yellow") > 1)
      return { index: 0, rule: "5 kabli: dokładnie 1 czerwony + >1 żółty → przetnij 1." };
    if (count("black") === 0)
      return { index: 1, rule: "5 kabli: brak czarnych → przetnij 2." };
    return { index: 0, rule: "5 kabli: wpp. → przetnij 1." };
  }

  // n === 6
  if (count("yellow") === 0 && serialOdd)
    return { index: 2, rule: "6 kabli: brak żółtych + nieparzysty serial → przetnij 3." };
  if (count("yellow") === 1 && count("white") > 1)
    return { index: 3, rule: "6 kabli: dokładnie 1 żółty + >1 biały → przetnij 4." };
  if (count("red") === 0)
    return { index: 5, rule: "6 kabli: brak czerwonych → przetnij ostatni (6.)." };
  return { index: 3, rule: "6 kabli: wpp. → przetnij 4." };
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
    return solveWires(wires, !serialLastDigitEven);
  }, [wires, serialLastDigitEven]);

  return (
    <Box sx={{ userSelect: "none" }}>
      <ModuleHeader
        title="Wires / Proste kable"
        onReset={reset}
        requiredData={[
          `PARZYSTOŚĆ NUMERU SERYJNEGO — ${serialLastDigitEven === null ? "?" : serialLastDigitEven ? "parzysty" : "nieparzysty"}`,
        ]}
        helpText="Klikaj 5 kolorowych guzików w kolejności kabli z bomby (od góry). Kable rysują się na dole, a program z każdym kliknięciem przelicza który przeciąć. Parzystość ostatniej cyfry seriala ustaw w panelu po lewej."
      />

      {needsSerial && !serialKnown && <MissingFactsBanner needed={["serialLastDigitEven"]} />}

      {/* 5 guzików — kolory kabli */}
      <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
        Klikaj kolory po kolei od góry ({wires.length}/6):
      </Typography>
      <Box sx={{ display: "flex", gap: 1.5, mb: 1, flexWrap: "wrap" }}>
        {ALL_COLORS.map((c) => (
          <Button
            key={c}
            onClick={() => addWire(c)}
            disabled={wires.length >= 6}
            title={COLOR_PL[c]}
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
            {COLOR_PL[c]}
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
          Cofnij ostatni
        </Button>
        <Typography variant="caption" sx={{ opacity: 0.6 }}>
          potrzebne min. 3 kable, max 6
        </Typography>
      </Box>

      <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap", alignItems: "flex-start" }}>
        {/* Kable od góry */}
        <Paper elevation={2} sx={{ p: 2, minWidth: 320, maxWidth: 420, flex: "0 1 auto" }}>
          {wires.length === 0 && (
            <Typography variant="body2" sx={{ opacity: 0.6 }}>
              Jeszcze nic nie kliknięto — kliknij pierwszy (górny) kabel.
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
                  title={COLOR_PL[w]}
                />
                <Box sx={{ width: 40, display: "flex", justifyContent: "center" }}>
                  {isTarget && <ContentCutIcon color="success" fontSize="medium" />}
                </Box>
              </Box>
            );
          })}
          {wires.length > 0 && wires.length < 3 && (
            <Typography variant="body2" sx={{ mt: 1, opacity: 0.7 }}>
              Kliknij jeszcze {3 - wires.length}…
            </Typography>
          )}
        </Paper>

        {/* Wynik */}
        <Box sx={{ minWidth: 280, maxWidth: 440, flex: 1 }}>
          {needsSerial && !serialKnown ? (
            <Alert severity="warning" sx={{ border: "3px solid #ed6c02" }}>
              <AlertTitle sx={{ fontWeight: 900, fontSize: 18 }}>
                NAJPIERW WPISZ POWYŻEJ PARZYSTOŚĆ SERIALA
              </AlertTitle>
              <Typography variant="body1" sx={{ fontWeight: 800, color: "error.main" }}>
                Bez tego wynik jest nieznany — nie wiadomo który kabel przeciąć.
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                Przy tych kablach ({wires.length}) pierwsza reguła zależy od tego, czy ostatnia
                cyfra seriala jest nieparzysta. Uzupełnij w banerze powyżej albo w lewym panelu.
              </Typography>
            </Alert>
          ) : solution ? (
            <Alert severity="success">
              <AlertTitle sx={{ fontWeight: 800, fontSize: 18 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <ContentCutIcon />
                  Przetnij kabel {solution.index + 1}. (od góry)
                </Box>
              </AlertTitle>
              <Typography variant="body2">{solution.rule}</Typography>
              <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
                Kolory od góry: {wires.map((w) => COLOR_PL[w]).join(" → ")}
              </Typography>
            </Alert>
          ) : (
            <Alert severity="info">
              {wires.length > 6
                ? "Za dużo kabli."
                : `Klikaj kolory — wynik pojawi się od 3 kabli (teraz: ${wires.length}).`}
            </Alert>
          )}
          <Typography variant="caption" sx={{ opacity: 0.6, mt: 1, display: "block" }}>
            Wynik przelicza się z każdym kliknięciem (3 vs 4 vs 5 vs 6 kabli to inne reguły).
            Zmiana parzystości seriala w lewym panelu też od razu zmienia wynik.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
