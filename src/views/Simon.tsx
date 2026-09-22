import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import { useAppStore } from "../store/AppStore";
import ModuleHeader from "../components/ModuleHeader";
import MissingFactsBanner from "../components/MissingFactsBanner";

type SimonColor = "red" | "blue" | "green" | "yellow";
type Strikes = 0 | 1 | 2;

const COLOR_LABEL: Record<SimonColor, string> = {
  red: "Czerwony",
  blue: "Niebieski",
  green: "Zielony",
  yellow: "Żółty",
};

const COLOR_SX: Record<SimonColor, { bgcolor: string; color: string }> = {
  red: { bgcolor: "#d32f2f", color: "#fff" },
  blue: { bgcolor: "#1976d2", color: "#fff" },
  green: { bgcolor: "#2e7d32", color: "#fff" },
  yellow: { bgcolor: "#f9a825", color: "#111" },
};

/**
 * Mapowanie zgodnie z grafiką:
 * - serialHasVowel = true: tabela "Jeśli numer seryjny zawiera samogłoskę"
 * - serialHasVowel = false: tabela "Jeśli numer seryjny nie zawiera samogłoski"
 *
 * Indeks: [serialHasVowel][strikes][flashColor] => pressColor
 */
const SIMON_MAP: Record<
  "hasVowel" | "noVowel",
  Record<Strikes, Record<SimonColor, SimonColor>>
> = {
  hasVowel: {
    0: { red: "blue", blue: "red", green: "yellow", yellow: "green" },
    1: { red: "yellow", blue: "green", green: "blue", yellow: "red" },
    2: { red: "green", blue: "red", green: "yellow", yellow: "blue" },
  },
  noVowel: {
    0: { red: "blue", blue: "yellow", green: "green", yellow: "red" },
    1: { red: "red", blue: "blue", green: "yellow", yellow: "green" },
    2: { red: "yellow", blue: "green", green: "blue", yellow: "red" },
  },
};

export default function Simon() {
  const serialHasVowel = useAppStore((s) => s.bombFacts.serialHasVowel);

  const [strikes, setStrikes] = React.useState<Strikes>(0);
  const [flashes, setFlashes] = React.useState<SimonColor[]>([]);
  const [presses, setPresses] = React.useState<SimonColor[]>([]);

  const hasVowelKnown = serialHasVowel !== null;
  const activeTableKey: "hasVowel" | "noVowel" = serialHasVowel
    ? "hasVowel"
    : "noVowel";

  const recomputePresses = React.useCallback(
    (
      nextFlashes: SimonColor[],
      nextStrikes: Strikes,
      nextTableKey: "hasVowel" | "noVowel"
    ) => {
      const map = SIMON_MAP[nextTableKey][nextStrikes];
      return nextFlashes.map((f) => map[f]);
    },
    []
  );

  React.useEffect(() => {
    setPresses(() => recomputePresses(flashes, strikes, activeTableKey));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    console.log(serialHasVowel);
  }, [serialHasVowel, strikes]);

  const onColorClick = (flashColor: SimonColor) => {
    if (!hasVowelKnown) return;
    setFlashes((prev) => {
      const next = [...prev, flashColor];
      setPresses(recomputePresses(next, strikes, activeTableKey));
      return next;
    });
  };

  const resetModule = () => {
    setFlashes([]);
    setPresses([]);
    setStrikes(0);
  };

  const onStrikesChange = (value: string) => {
    const n = Number(value);
    if (n === 0 || n === 1 || n === 2) setStrikes(n as Strikes);
  };

  const renderSeq = (seq: SimonColor[]) => {
    if (seq.length === 0) {
      return (
        <Typography variant="body2" sx={{ opacity: 0.7 }}>
          (pusto)
        </Typography>
      );
    }
    return (
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {seq.map((c, idx) => (
          <Chip
            key={`${c}-${idx}`}
            label={COLOR_LABEL[c]}
            size="small"
            sx={{
              bgcolor: COLOR_SX[c].bgcolor,
              color: COLOR_SX[c].color,
              fontWeight: 600,
            }}
          />
        ))}
      </Stack>
    );
  };

  return (
    <Box sx={{ userSelect: "none" }}>
      <ModuleHeader
        title="Simon Says"
        onReset={resetModule}
        requiredData={[
          `NUMER SERYJNY - ${serialHasVowel === null ? "?" : serialHasVowel ? "z samogłoską" : "bez samogłoski"}`,
        ]}
      />

      <MissingFactsBanner needed={["serialHasVowel"]} />

      <Divider sx={{ mb: 2 }} />

      {/* Strikes */}
      <FormControl sx={{ mb: 2 }}>
        <FormLabel>Liczba błędów (strikes)</FormLabel>
        <RadioGroup
          row
          value={String(strikes)}
          onChange={(e) => onStrikesChange(e.target.value)}
        >
          <FormControlLabel value="0" control={<Radio />} label="0" />
          <FormControlLabel value="1" control={<Radio />} label="1" />
          <FormControlLabel value="2" control={<Radio />} label="2" />
        </RadioGroup>
      </FormControl>

      {/* Buttons */}
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
        {(["red", "blue", "green", "yellow"] as const).map((c) => (
          <Button
            key={c}
            variant="contained"
            onClick={() => onColorClick(c)}
            disabled={!hasVowelKnown}
            sx={{
              bgcolor: COLOR_SX[c].bgcolor,
              color: COLOR_SX[c].color,
              "&:hover": { bgcolor: COLOR_SX[c].bgcolor },
              minWidth: 140,
              fontWeight: 700,
            }}
          >
            {COLOR_LABEL[c]}
          </Button>
        ))}
      </Box>

      {/* Sequences */}
      <Box sx={{ display: "grid", gap: 2 }}>
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Kliknięte przez gracza (kolory, które migały)
          </Typography>
          {renderSeq(flashes)}
        </Box>

        <Box>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Do kliknięcia (przeliczone wg tabeli)
          </Typography>
          {!hasVowelKnown ? (
            <Typography variant="body1" sx={{ fontWeight: 800, color: "error.main" }}>
              NAJPIERW WPISZ POWYŻEJ CZY NUMER MA SAMOGŁOSKĘ — bez tego tabela jest nieznana.
            </Typography>
          ) : (
            renderSeq(presses)
          )}
        </Box>
      </Box>
    </Box>
  );
}
