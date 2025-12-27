import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";

import { useAppStore } from "../store/AppStore";

// Extended Morse Alphabet — Polish + International
const MORSE_MAP: Record<string, string> = {
  a: ".-",
  ą: ".-.-",
  b: "-...",
  c: "-.-.",
  ć: "-.-..",
  d: "-..",
  e: ".",
  ę: "..-..",
  f: "..-.",
  g: "--.",
  h: "....",
  i: "..",
  j: ".---",
  k: "-.-",
  l: ".-..",
  ł: ".-..-",
  m: "--",
  n: "-.",
  ń: "--.--",
  o: "---",
  ó: "---.",
  p: ".--.",
  q: "--.-",
  r: ".-.",
  s: "...",
  ś: "...-...",
  t: "-",
  u: "..-",
  v: "...-",
  w: ".--",
  x: "-..-",
  y: "-.--",
  z: "--..",
  ż: "--..-",
  ź: "--..-.",
};

const sanitizeInput = (s: string) => s.replace(/[^.-]/g, "");

type Strength = "prefix" | "cyclic" | "none";

export default function Morse() {
  const langFile = useAppStore((s) => s.t);
  const morseWords = (langFile.morseWords ?? {}) as Record<string, number>;

  const [pattern, setPattern] = React.useState("");

  const append = (ch: "." | "-") => setPattern((p) => p + ch);
  const backspace = () => setPattern((p) => p.slice(0, -1));
  const reset = () => setPattern("");
  const onTextChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setPattern(sanitizeInput(e.target.value));

  const results = React.useMemo(() => {
    return Object.entries(morseWords).map(([word, freq]) => {
      const code = [...word.toLowerCase()]
        .map((c) => MORSE_MAP[c] || "")
        .join("");

      if (!pattern)
        return {
          word,
          code,
          freq,
          strength: "prefix" as Strength,
          matchSlice: null,
        };

      if (code.startsWith(pattern))
        return {
          word,
          code,
          freq,
          strength: "prefix" as Strength,
          matchSlice: [0, pattern.length],
        };

      const doubled = code + code;
      const idx = doubled.indexOf(pattern);
      if (idx !== -1 && idx < code.length)
        return {
          word,
          code,
          freq,
          strength: "cyclic" as Strength,
          matchSlice: [idx, idx + pattern.length],
        };

      return {
        word,
        code,
        freq,
        strength: "none" as Strength,
        matchSlice: null,
      };
    });
  }, [pattern, morseWords]);

  const sorted = [...results].sort((a, b) => {
    const rank = { prefix: 0, cyclic: 1, none: 2 };
    return rank[a.strength] - rank[b.strength];
  });

  const prefixMatches = sorted.filter((x) => x.strength === "prefix");
  const cyclicMatches = sorted.filter((x) => x.strength === "cyclic");

  const prefixSingle = prefixMatches.length === 1 ? prefixMatches[0] : null;
  const cyclicSingle =
    !prefixSingle && cyclicMatches.length === 1 ? cyclicMatches[0] : null;

  return (
    <Box sx={{ userSelect: "none" }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Button variant="contained" color="error" onClick={reset}>
          Reset
        </Button>
        <Typography variant="h5">Morse</Typography>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Controls */}
      <Stack direction="row" spacing={1}>
        <Button variant="contained" onClick={() => append(".")}>
          •
        </Button>
        <Button variant="contained" onClick={() => append("-")}>
          —
        </Button>
        <Button variant="outlined" color="warning" onClick={backspace}>
          ⌫
        </Button>
      </Stack>

      <TextField
        fullWidth
        sx={{ mt: 2 }}
        value={pattern}
        onChange={onTextChange}
        slotProps={{
        input: {
          style: {
            fontFamily: "monospace",
            fontSize: 18,
          },
        },
      }}
        autoFocus
      />

      <Divider sx={{ my: 2 }} />

      {/* Word Grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          gap: 1,
        }}
      >
        {sorted.map(({ word, code, freq, strength, matchSlice }) => {
          const opacity = strength === "none" ? 0.22 : 1;
          const isPrefix = strength === "prefix";
          const isCyclic = strength === "cyclic";

          let content: React.ReactNode = code;

          if (matchSlice) {
            const [start, end] = matchSlice;
            const len = code.length;

            // Normal prefix highlight
            if (end <= len) {
              content = (
                <>
                  {code.slice(0, start)}
                  <span style={{ background: "yellow" }}>
                    {code.slice(start, end)}
                  </span>
                  {code.slice(end)}
                </>
              );
            } else {
              // Cyclic wrap highlight
              const firstEnd = len;
              const wrapLen = end - len;

              content = (
                <>
                  {code.slice(0, start)}
                  <span style={{ background: "yellow" }}>
                    {code.slice(start, firstEnd)}
                  </span>
                  <span style={{ background: "#79d4ff" }}>
                    {code.slice(0, wrapLen)}
                  </span>
                  {code.slice(wrapLen)}
                </>
              );
            }
          }

          return (
            <Box
              key={word}
              sx={{
                opacity,
                border: `2px solid ${isPrefix ? "#4caf50" : isCyclic ? "#0088cc" : "#ccc"}`,
                p: 0.5,
                borderRadius: 1,
                background: isPrefix
                  ? "#e9ffe3"
                  : isCyclic
                    ? "#e3f5ff"
                    : "#fff",
                fontSize: "0.75rem",
                minHeight: 64,
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                {word} — <strong>3.{freq} MHz</strong>
              </Typography>

              <Typography
                variant="caption"
                sx={{
                  fontFamily: "monospace",
                  whiteSpace: "normal",
                  wordBreak: "break-word",
                }}
              >
                {content}
              </Typography>
            </Box>
          );
        })}
      </Box>

      {/* Final selected frequency */}
      {(prefixSingle || cyclicSingle) && (
        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: prefixSingle ? "#2e7d32" : "#777",
            }}
          >
            3.{(prefixSingle ?? cyclicSingle)!.freq} MHz
          </Typography>
        </Box>
      )}
    </Box>
  );
}
