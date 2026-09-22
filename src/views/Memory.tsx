import * as React from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import ModuleHeader from "../components/ModuleHeader";

type DisplayNum = 1 | 2 | 3 | 4;
type StageNum = 1 | 2 | 3 | 4 | 5;

interface StageInput {
  display: DisplayNum | null;
  // etykiety przycisków na pozycjach 1-4 (od lewej)
  labels: (DisplayNum | null)[];
}

interface Pressed {
  pos: DisplayNum; // pozycja 1-4
  label: DisplayNum; // etykieta na tej pozycji
}

const emptyStage = (): StageInput => ({
  display: null,
  labels: [null, null, null, null],
});

// Zwraca instrukcję wg manuala (pozycja lub etykieta).
// history: dotychczas wciśnięte (indeks 0 = stage1).
function ruleFor(
  stage: StageNum,
  display: DisplayNum,
  history: Pressed[]
): { kind: "position"; value: DisplayNum; text: string } | { kind: "label"; value: DisplayNum; text: string } {
  switch (stage) {
    case 1:
      if (display === 1) return { kind: "position", value: 2, text: "poz. 2" };
      if (display === 2) return { kind: "position", value: 2, text: "poz. 2" };
      if (display === 3) return { kind: "position", value: 3, text: "poz. 3" };
      return { kind: "position", value: 4, text: "poz. 4" };
    case 2:
      if (display === 1) return { kind: "label", value: 4, text: 'etykieta "4"' };
      if (display === 2) return { kind: "position", value: history[0].pos, text: `poz. ${history[0].pos} (jak w st.1)` };
      if (display === 3) return { kind: "position", value: 1, text: "poz. 1" };
      return { kind: "position", value: history[0].pos, text: `poz. ${history[0].pos} (jak w st.1)` };
    case 3:
      if (display === 1) return { kind: "label", value: history[1].label, text: `etykieta "${history[1].label}" (jak w st.2)` };
      if (display === 2) return { kind: "label", value: history[0].label, text: `etykieta "${history[0].label}" (jak w st.1)` };
      if (display === 3) return { kind: "position", value: 3, text: "poz. 3" };
      return { kind: "label", value: 4, text: 'etykieta "4"' };
    case 4:
      if (display === 1) return { kind: "position", value: history[0].pos, text: `poz. ${history[0].pos} (jak w st.1)` };
      if (display === 2) return { kind: "position", value: 1, text: "poz. 1" };
      if (display === 3) return { kind: "position", value: history[1].pos, text: `poz. ${history[1].pos} (jak w st.2)` };
      return { kind: "position", value: history[1].pos, text: `poz. ${history[1].pos} (jak w st.2)` };
    case 5:
      if (display === 1) return { kind: "label", value: history[0].label, text: `etykieta "${history[0].label}" (jak w st.1)` };
      if (display === 2) return { kind: "label", value: history[1].label, text: `etykieta "${history[1].label}" (jak w st.2)` };
      if (display === 3) return { kind: "label", value: history[3].label, text: `etykieta "${history[3].label}" (jak w st.4)` };
      return { kind: "label", value: history[2].label, text: `etykieta "${history[2].label}" (jak w st.3)` };
  }
}

// Czy mamy komplet danych żeby policzyć regułę dla danego stage?
function canCompute(stage: StageNum, input: StageInput, history: Pressed[]): boolean {
  if (!input.display) return false;
  // reguły "position N" nie wymagają etykiet; reguły "label 4" też nie.
  // reguły odwołujące się do historii wymagają żeby historia istniała.
  const needHistory =
    (stage === 2 && (input.display === 2 || input.display === 4)) ||
    (stage === 3 && (input.display === 1 || input.display === 2)) ||
    stage === 4 ||
    stage === 5;
  if (needHistory) {
    const needLen = stage === 2 ? 1 : stage === 3 ? 2 : stage === 4 ? 2 : 4;
    if (history.length < needLen) return false;
  }
  return true;
}

// Rozwiąż instrukcję do konkretnej pozycji (do podświetlenia).
function resolveToPosition(
  rule: { kind: "position"; value: DisplayNum } | { kind: "label"; value: DisplayNum },
  labels: (DisplayNum | null)[]
): DisplayNum | null {
  if (rule.kind === "position") return rule.value;
  const idx = labels.findIndex((l) => l === rule.value);
  return idx === -1 ? null : ((idx + 1) as DisplayNum);
}

export default function Memory() {
  const [stages, setStages] = React.useState<StageInput[]>(
    Array.from({ length: 5 }, emptyStage)
  );
  const [activeStage, setActiveStage] = React.useState<StageNum>(1);

  const reset = () => {
    setStages(Array.from({ length: 5 }, emptyStage));
    setActiveStage(1);
  };

  // Historia wciśnięć wyliczona automatycznie ze wszystkich kompletnych stage'ów po kolei.
  // Jeśli stage N ma display + da się policzyć regułę + da się rozwiązać pozycję
  // (etykiety kompletne gdy potrzebne), to dopisujemy do historii.
  const history: (Pressed | null)[] = React.useMemo(() => {
    const out: (Pressed | null)[] = [null, null, null, null, null];
    const hist: Pressed[] = [];
    for (let i = 0; i < 5; i++) {
      const st = stages[i];
      const stageNum = (i + 1) as StageNum;
      if (!st.display) continue;
      if (!canCompute(stageNum, st, hist)) continue;
      const rule = ruleFor(stageNum, st.display, hist);
      const pos = resolveToPosition(rule, st.labels);
      if (!pos) continue;
      const label = st.labels[pos - 1];
      if (!label) continue;
      const pressed = { pos, label };
      out[i] = pressed;
      hist.push(pressed);
    }
    return out;
  }, [stages]);

  const histCompact = React.useMemo(
    () => history.filter((h): h is Pressed => h !== null),
    [history]
  );

  const setDisplay = (stageIdx: number, d: DisplayNum) => {
    setStages((prev) => {
      const next = [...prev];
      next[stageIdx] = { ...next[stageIdx], display: d };
      return next;
    });
  };

  const setLabel = (stageIdx: number, posIdx: number, label: DisplayNum) => {
    setStages((prev) => {
      const next = [...prev];
      const labels = [...next[stageIdx].labels] as (DisplayNum | null)[];
      labels[posIdx] = labels[posIdx] === label ? null : label;
      // alternatywa: klik = ustaw; ponowny klik tej samej = wyczyść.
      // żeby szybko wpisywać, klik innej liczby nadpisuje:
      if (labels[posIdx] === null) {
        // toggle off -> zostaw null (już)
      }
      next[stageIdx] = { ...next[stageIdx], labels };
      return next;
    });
  };

  const activeIdx = activeStage - 1;
  const activeInput = stages[activeIdx];
  const activeHist = histCompact.slice(0, activeIdx);
  const activeRule =
    activeInput.display && canCompute(activeStage, activeInput, activeHist)
      ? ruleFor(activeStage, activeInput.display, activeHist)
      : null;
  const activeResolved =
    activeRule && activeInput.display
      ? resolveToPosition(activeRule, activeInput.labels)
      : null;

  const stageComplete = (i: number) => history[i] !== null;

  return (
    <Box sx={{ userSelect: "none" }}>
      <ModuleHeader
        title="Memory / Pamięć"
        onReset={reset}
        requiredData={["WYŚWIETLACZ (1-4)", "ETYKIETY 4 PRZYCISKÓW"]}
        helpText="Dla każdego stage'u: kliknij liczbę na wyświetlaczu (1-4), potem dla każdej pozycji 1-4 kliknij etykietę widoczną na bombie. Program sam liczy który przycisk wcisnąć wg manuala i pamięta historię (przy błędnym wciśnięciu na bombie moduł wraca do stage 1 — wtedy kliknij Reset)."
      />

      {/* Pasek stage'ów */}
      <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
        {([1, 2, 3, 4, 5] as StageNum[]).map((s) => (
          <Button
            key={s}
            variant={activeStage === s ? "contained" : "outlined"}
            color={stageComplete(s - 1) ? "success" : "primary"}
            onClick={() => setActiveStage(s)}
          >
            Stage {s} {stageComplete(s - 1) ? "✓" : ""}
          </Button>
        ))}
      </Box>

      <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap", alignItems: "flex-start" }}>
        {/* Edycja aktywnego stage */}
        <Paper elevation={2} sx={{ p: 2, minWidth: 320, maxWidth: 480 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
            Stage {activeStage}
          </Typography>

          <Typography variant="body2" sx={{ mb: 1 }}>
            1) Liczba na ekranie:
          </Typography>
          <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
            {([1, 2, 3, 4] as DisplayNum[]).map((d) => (
              <Button
                key={d}
                variant={activeInput.display === d ? "contained" : "outlined"}
                onClick={() => setDisplay(activeIdx, d)}
                sx={{ minWidth: 56, fontSize: 20, fontWeight: 800 }}
              >
                {d}
              </Button>
            ))}
          </Box>

          <Typography variant="body2" sx={{ mb: 1 }}>
            2) Etykiety na 4 przyciskach od lewej (kliknij liczbę pod pozycją):
          </Typography>
          <Box sx={{ display: "flex", gap: 1.5 }}>
            {([0, 1, 2, 3] as const).map((posIdx) => {
              const isTarget = activeResolved === posIdx + 1;
              return (
                <Box
                  key={posIdx}
                  sx={{
                    p: 1,
                    borderRadius: 1,
                    border: isTarget ? "3px solid #2e7d32" : "1px solid rgba(0,0,0,0.2)",
                    bgcolor: isTarget ? "rgba(76,175,80,0.15)" : "transparent",
                    textAlign: "center",
                    minWidth: 86,
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>
                    POZ. {posIdx + 1}
                  </Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, mt: 0.5 }}>
                    {([1, 2, 3, 4] as DisplayNum[]).map((l) => (
                      <Button
                        key={l}
                        size="small"
                        variant={activeInput.labels[posIdx] === l ? "contained" : "outlined"}
                        onClick={() => setLabel(activeIdx, posIdx, l)}
                        sx={{ minWidth: 0, fontWeight: 700 }}
                      >
                        {l}
                      </Button>
                    ))}
                  </Box>
                </Box>
              );
            })}
          </Box>

          <Box sx={{ mt: 2 }}>
            {!activeInput.display && (
              <Alert severity="info">Wybierz liczbę z wyświetlacza.</Alert>
            )}
            {activeInput.display && !activeRule && (
              <Alert severity="warning">
                Uzupełnij wcześniejsze stage'e — ta reguła odwołuje się do historii.
              </Alert>
            )}
            {activeRule && (
              <Alert severity={activeResolved ? "success" : "warning"}>
                <Typography variant="body1" sx={{ fontWeight: 800 }}>
                  Wciśnij: {activeRule.text}
                  {activeResolved
                    ? ` → przycisk na pozycji ${activeResolved}`
                    : " (uzupełnij etykiety żeby wskazać pozycję)"}
                </Typography>
              </Alert>
            )}
          </Box>

          <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
            <Button
              variant="outlined"
              disabled={activeStage === 1}
              onClick={() => setActiveStage((s) => Math.max(1, s - 1) as StageNum)}
            >
              ← Wstecz
            </Button>
            <Button
              variant="outlined"
              disabled={activeStage === 5}
              onClick={() => setActiveStage((s) => Math.min(5, s + 1) as StageNum)}
            >
              Dalej →
            </Button>
          </Box>
        </Paper>

        {/* Historia / podsumowanie */}
        <Box sx={{ minWidth: 300, flex: 1 }}>
          <TableContainer component={Paper} elevation={2}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Stage</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Ekran</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Etykiety (poz.1-4)</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Wciśnij</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {[0, 1, 2, 3, 4].map((i) => (
                  <TableRow
                    key={i}
                    hover
                    selected={i === activeIdx}
                    onClick={() => setActiveStage((i + 1) as StageNum)}
                    sx={{ cursor: "pointer" }}
                  >
                    <TableCell sx={{ fontWeight: 700 }}>{i + 1}</TableCell>
                    <TableCell>{stages[i].display ?? "–"}</TableCell>
                    <TableCell>
                      {stages[i].labels.map((l) => l ?? "?").join(" ")}
                    </TableCell>
                    <TableCell>
                      {history[i] ? (
                        <Chip
                          size="small"
                          color="success"
                          label={`poz. ${history[i]!.pos} ("${history[i]!.label}")`}
                        />
                      ) : (
                        "–"
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Typography variant="caption" sx={{ opacity: 0.65, mt: 1, display: "block" }}>
            Kliknij wiersz żeby edytować stage. Błąd na bombie = reset modułu do stage 1 (tu też kliknij Reset).
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
