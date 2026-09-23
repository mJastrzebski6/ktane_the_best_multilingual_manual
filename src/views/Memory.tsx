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
import { fmt, useAppStore } from "../store/AppStore";

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
// Teksty budowane z szablonów językowych (m.*T), logika ta sama we wszystkich językach.
interface MemTemplates {
  posT: string;
  labelT: string;
  refT: string;
  label4T: string;
}

function ruleFor(
  stage: StageNum,
  display: DisplayNum,
  history: Pressed[],
  m: MemTemplates
): { kind: "position"; value: DisplayNum; text: string } | { kind: "label"; value: DisplayNum; text: string } {
  const pos = (n: number, ref?: number) =>
    fmt(m.posT, { n }) + (ref === undefined ? "" : " " + fmt(m.refT, { n: ref }));
  const lab = (l: number, ref?: number) =>
    fmt(m.labelT, { l }) + (ref === undefined ? "" : " " + fmt(m.refT, { n: ref }));
  switch (stage) {
    case 1:
      if (display === 1) return { kind: "position", value: 2, text: pos(2) };
      if (display === 2) return { kind: "position", value: 2, text: pos(2) };
      if (display === 3) return { kind: "position", value: 3, text: pos(3) };
      return { kind: "position", value: 4, text: pos(4) };
    case 2:
      if (display === 1) return { kind: "label", value: 4, text: m.label4T };
      if (display === 2) return { kind: "position", value: history[0].pos, text: pos(history[0].pos, 1) };
      if (display === 3) return { kind: "position", value: 1, text: pos(1) };
      return { kind: "position", value: history[0].pos, text: pos(history[0].pos, 1) };
    case 3:
      if (display === 1) return { kind: "label", value: history[1].label, text: lab(history[1].label, 2) };
      if (display === 2) return { kind: "label", value: history[0].label, text: lab(history[0].label, 1) };
      if (display === 3) return { kind: "position", value: 3, text: pos(3) };
      return { kind: "label", value: 4, text: m.label4T };
    case 4:
      if (display === 1) return { kind: "position", value: history[0].pos, text: pos(history[0].pos, 1) };
      if (display === 2) return { kind: "position", value: 1, text: pos(1) };
      if (display === 3) return { kind: "position", value: history[1].pos, text: pos(history[1].pos, 2) };
      return { kind: "position", value: history[1].pos, text: pos(history[1].pos, 2) };
    case 5:
      if (display === 1) return { kind: "label", value: history[0].label, text: lab(history[0].label, 1) };
      if (display === 2) return { kind: "label", value: history[1].label, text: lab(history[1].label, 2) };
      if (display === 3) return { kind: "label", value: history[3].label, text: lab(history[3].label, 4) };
      return { kind: "label", value: history[2].label, text: lab(history[2].label, 3) };
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
  const t = useAppStore((s) => s.t);
  const m = (t?.ui?.memory ?? {}) as Record<string, string>;
  const memT: MemTemplates = React.useMemo(
    () => ({
      posT: m.posT ?? "pos. {n}",
      labelT: m.labelT ?? "label \"{l}\"",
      refT: m.refT ?? "(as in st.{n})",
      label4T: m.label4T ?? "label \"4\"",
    }),
    [m]
  );
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
      const rule = ruleFor(stageNum, st.display, hist, memT);
      const pos = resolveToPosition(rule, st.labels);
      if (!pos) continue;
      const label = st.labels[pos - 1];
      if (!label) continue;
      const pressed = { pos, label };
      out[i] = pressed;
      hist.push(pressed);
    }
    return out;
  }, [stages, memT]);

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
      ? ruleFor(activeStage, activeInput.display, activeHist, memT)
      : null;
  const activeResolved =
    activeRule && activeInput.display
      ? resolveToPosition(activeRule, activeInput.labels)
      : null;

  const stageComplete = (i: number) => history[i] !== null;

  return (
    <Box sx={{ userSelect: "none" }}>
      <ModuleHeader
        title={m.title ?? "Memory"}
        onReset={reset}
        requiredData={[m.reqDisplay ?? "", m.reqLabels ?? ""]}
        helpText={m.help}
      />

      {/* Pasek stage'ów */}
      <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
        {([1, 2, 3, 4, 5] as StageNum[]).map((sn) => (
          <Button
            key={sn}
            variant={activeStage === sn ? "contained" : "outlined"}
            color={stageComplete(sn - 1) ? "success" : "primary"}
            onClick={() => setActiveStage(sn)}
          >
            {fmt(m.stageN ?? "", { n: sn })} {stageComplete(sn - 1) ? "✓" : ""}
          </Button>
        ))}
      </Box>

      <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap", alignItems: "flex-start" }}>
        {/* Edycja aktywnego stage */}
        <Paper elevation={2} sx={{ p: 2, minWidth: 320, maxWidth: 480 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
            {fmt(m.stageN ?? "", { n: activeStage })}
          </Typography>

          <Typography variant="body2" sx={{ mb: 1 }}>
            {m.displayPrompt ?? ""}
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
            {m.labelsPrompt ?? ""}
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
                    {fmt(m.posShort ?? "", { n: posIdx + 1 })}
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
              <Alert severity="info">{m.pickDisplay ?? ""}</Alert>
            )}
            {activeInput.display && !activeRule && (
              <Alert severity="warning">
                {m.needHistory ?? ""}
              </Alert>
            )}
            {activeRule && (
              <Alert severity={activeResolved ? "success" : "warning"}>
                <Typography variant="body1" sx={{ fontWeight: 800 }}>
                  {fmt(m.pressIs ?? "", { t: activeRule.text })}
                  {activeResolved
                    ? ` ${fmt(m.toPos ?? "", { n: activeResolved })}`
                    : ` ${m.needLabels ?? ""}`}
                </Typography>
              </Alert>
            )}
          </Box>

          <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
            <Button
              variant="outlined"
              disabled={activeStage === 1}
              onClick={() => setActiveStage((st) => Math.max(1, st - 1) as StageNum)}
            >
              {m.back ?? ""}
            </Button>
            <Button
              variant="outlined"
              disabled={activeStage === 5}
              onClick={() => setActiveStage((st) => Math.min(5, st + 1) as StageNum)}
            >
              {m.next ?? ""}
            </Button>
          </Box>
        </Paper>

        {/* Historia / podsumowanie */}
        <Box sx={{ minWidth: 300, flex: 1 }}>
          <TableContainer component={Paper} elevation={2}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>{m.thStage ?? ""}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{m.thDisplay ?? ""}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{m.thLabels ?? ""}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{m.thPress ?? ""}</TableCell>
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
                          label={`${fmt(memT.posT, { n: history[i]!.pos })} ("${history[i]!.label}")`}
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
            {m.resetHint ?? ""}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
