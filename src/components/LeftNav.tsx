import {
  Box,
  Button,
  Divider,
  FormControlLabel,
  FormGroup,
  MenuItem,
  Select,
  Switch,
  Typography,
} from "@mui/material";
import { useAppStore, type ViewId, type BatteryCount } from "../store/AppStore";
import { useEffect } from "react";

import { readStoredLang, storeLang } from "../utils/Storage";
// wires
import WireHorizontal from "../images/WireHorizontalComponent.svg";
import WireVertical from "../images/WireVerticalComponent.svg";
import WireABC from "../images/WireABCComponent.svg";

// lingual
import PasswordComponent from "../images/PasswordComponent.svg";
import WhosOnFirstComponent from "../images/WhosOnFirstComponent.svg";
import MorseComponent from "../images/MorseComponent.svg";

// colors
import SimonComponent from "../images/SimonComponent.svg";
import BigButtonComponent from "../images/ButtonComponent.svg";
import KeypadComponent from "../images/KeypadComponent.svg";

// rest
import MazeComponent from "../images/MazeComponent.svg";
import MemoryComponent from "../images/MemoryComponent.svg";
import NeedyKnobComponent from "../images/NeedyKnobComponent.svg";

const items: { id: ViewId; img: string }[] = [
  { id: "wire_horizontal", img: WireHorizontal },
  { id: "wire_vertical", img: WireVertical },
  { id: "wire_ABC", img: WireABC },

  { id: "password", img: PasswordComponent },
  { id: "whos_on_first", img: WhosOnFirstComponent },
  { id: "morse", img: MorseComponent },

  { id: "simon", img: SimonComponent },
  { id: "big_button", img: BigButtonComponent },
  { id: "keypad", img: KeypadComponent },

  { id: "maze", img: MazeComponent },
  { id: "memory", img: MemoryComponent },
  { id: "needy_knob", img: NeedyKnobComponent },
];

const LANG_STORAGE_KEY = "app.lang";

function BorderedInlineChoice(props: {
  selected: boolean;
  onSelect: () => void;
  label: string;
}) {
  const { selected, onSelect, label } = props;

  return (
    <Box
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onSelect();
      }}
      sx={{
        cursor: "pointer",
        border: "1px solid rgba(0,0,0,0.18)",
        borderRadius: 1,
        px: 0.9,
        py: 0.45,
        display: "flex",
        alignItems: "center",
        gap: 0.75,
        minWidth: 0,
        userSelect: "none",
        backgroundColor: selected ? "rgba(0,0,0,0.10)" : "rgba(0,0,0,0.02)",
        "&:hover": { opacity: 0.9 },
      }}
    >
      <Box
        sx={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          border: "1px solid rgba(0,0,0,0.35)",
          backgroundColor: selected ? "rgba(0,0,0,0.55)" : "transparent",
          flexShrink: 0,
        }}
      />
      <Typography variant="caption" sx={{ whiteSpace: "nowrap" }}>
        {label}
      </Typography>
    </Box>
  );
}

export function LeftNav() {
  const {
    setActiveView,
    lang,
    setLang,
    availableLangs,
    bombFacts,
    setBombFacts,
    setBatteryCount,
    resetBombFacts,
  } = useAppStore();

  const batteryCount = bombFacts.batteryCount;

  const setCount = (c: BatteryCount) => setBatteryCount(c);

  useEffect(() => {
    const keys = availableLangs.map((l) => l.key);
    const initial = readStoredLang(keys);

    if (!localStorage.getItem(LANG_STORAGE_KEY)) {
      storeLang(initial);
    }

    // jeśli store ma inny lang (np. domyślny), ustaw z localStorage
    if (lang !== initial) setLang(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableLangs]);

  return (
    <Box
      sx={{
        width: { xs: 220, sm: 260, md: 280 },
        height: "100vh",
        position: "sticky",
        top: 0,
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid #ddd",
        bgcolor: "background.paper",
        overflow: "hidden",

        userSelect: "none",
        WebkitUserSelect: "none",
        MozUserSelect: "none",
        msUserSelect: "none",
      }}
    >
      {/* LANGUAGE SELECT */}
      <Box sx={{ p: 1 }}>
        <Typography variant="caption" sx={{ mb: 0.5, display: "block" }}>
          Language
        </Typography>

        <Select
          size="small"
          fullWidth
          value={lang}
          onChange={(e) => {
            const next = String(e.target.value);
            setLang(next);
            storeLang(next);
          }}
        >
          {availableLangs.map((lng) => (
            <MenuItem key={lng.key} value={lng.key}>
              {lng.label}
            </MenuItem>
          ))}
        </Select>
      </Box>

      {/* NAV GRID */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gridTemplateRows: "repeat(4, minmax(0, 1fr))",
          gap: 1,
          p: 1,
          overflow: "hidden",
        }}
      >
        {items.map((item) => (
          <Box
            key={item.id}
            onClick={() => setActiveView(item.id)}
            sx={{
              cursor: "pointer",
              borderRadius: 1,
              border: "1px solid rgba(0,0,0,0.10)",
              p: 0.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              "&:hover": { opacity: 0.85 },
            }}
          >
            <img
              src={item.img}
              alt={item.id}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                display: "block",
              }}
            />
          </Box>
        ))}
      </Box>

      {/* GLOBAL STATE PANEL */}
      <Divider />
      <Box
        sx={{
          p: 1,
          borderTop: "1px solid rgba(0,0,0,0.06)",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: 1,
            mb: 0.5,
          }}
        >
          <Typography variant="subtitle2">Global facts</Typography>

          <Button size="small" variant="outlined" onClick={resetBombFacts}>
            Reset
          </Button>
        </Box>

        <FormGroup>
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={bombFacts.serialLastDigitEven}
                onChange={(e) =>
                  setBombFacts({ serialLastDigitEven: e.target.checked })
                }
              />
            }
            label="Ostatnia cyfra seryjnego parzysta"
          />

          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={bombFacts.serialHasVowel}
                onChange={(e) =>
                  setBombFacts({ serialHasVowel: e.target.checked })
                }
              />
            }
            label="Seryjny ma samogłoskę"
          />

          <Divider sx={{ my: 0.5 }} />

          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={bombFacts.indicatorCAR}
                onChange={(e) =>
                  setBombFacts({ indicatorCAR: e.target.checked })
                }
              />
            }
            label="Wskaźnik CAR się świeci"
          />

          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={bombFacts.indicatorFRK}
                onChange={(e) =>
                  setBombFacts({ indicatorFRK: e.target.checked })
                }
              />
            }
            label="Wskaźnik FRK się świeci"
          />

          <Divider sx={{ my: 0.5 }} />

          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={bombFacts.hasParallelPort}
                onChange={(e) =>
                  setBombFacts({ hasParallelPort: e.target.checked })
                }
              />
            }
            label="Ma port równoległy"
          />

          <Divider sx={{ my: 0.5 }} />

          <Typography variant="caption" sx={{ display: "block", mb: 0.5 }}>
            Baterie (0 / 1 / 2 / 3+)
          </Typography>

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
            <BorderedInlineChoice
              selected={batteryCount === 0}
              onSelect={() => setCount(0)}
              label="0"
            />
            <BorderedInlineChoice
              selected={batteryCount === 1}
              onSelect={() => setCount(1)}
              label="1"
            />
            <BorderedInlineChoice
              selected={batteryCount === 2}
              onSelect={() => setCount(2)}
              label="2"
            />
            <BorderedInlineChoice
              selected={batteryCount === 3}
              onSelect={() => setCount(3)}
              label="3+"
            />
          </Box>
        </FormGroup>
      </Box>
    </Box>
  );
}
