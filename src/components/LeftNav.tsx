import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  FormGroup,
  MenuItem,
  Select,
  Switch,
  Typography,
} from "@mui/material";
import { useAppStore, type ViewId } from "../store/AppStore";

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

function BorderedInlineCheckbox(props: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  const { checked, onChange, label } = props;

  return (
    <Box
      sx={{
        border: "1px solid rgba(0,0,0,0.18)",
        borderRadius: 1,
        px: 0.75,
        py: 0.25,
        display: "flex",
        alignItems: "center",
        gap: 0.5,
        minWidth: 0,
        backgroundColor: "rgba(0,0,0,0.02)",
      }}
    >
      <Checkbox
        size="small"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        sx={{ p: 0.5 }}
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
    setBatteryFlag,
    resetBombFacts,
  } = useAppStore();

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
        overflow: "hidden", // brak scrolla dla całego nav
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
          onChange={(e) => setLang(e.target.value)}
        >
          {availableLangs.map((lng) => (
            <MenuItem key={lng.key} value={lng.key}>
              {lng.label}
            </MenuItem>
          ))}
        </Select>
      </Box>

      {/* NAV GRID (bez scrolla, obrazki w całości widoczne) */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gridTemplateRows: "repeat(4, minmax(0, 1fr))", // 12 elementów => 4 rzędy
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
                objectFit: "contain", // pełny obraz, bez obcinania
                display: "block",
              }}
            />
          </Box>
        ))}
      </Box>

      {/* GLOBAL STATE PANEL (RESETOWALNE) */}
      <Divider />
      <Box
        sx={{
          p: 1,
          borderTop: "1px solid rgba(0,0,0,0.06)",
          overflow: "hidden", // brak scrolla także tutaj
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
            Baterie (spójne zależności)
          </Typography>

          {/* BATTERIES: podpisy >1, >=2, >2 + obok siebie + border per control */}
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 0.75,
            }}
          >
            <BorderedInlineCheckbox
              checked={bombFacts.batteriesMoreThan1}
              onChange={(checked) =>
                setBatteryFlag("batteriesMoreThan1", checked)
              }
              label=">1"
            />

            <BorderedInlineCheckbox
              checked={bombFacts.batteries2OrMore}
              onChange={(checked) =>
                setBatteryFlag("batteries2OrMore", checked)
              }
              label=">=2"
            />

            <BorderedInlineCheckbox
              checked={bombFacts.batteriesMoreThan2}
              onChange={(checked) =>
                setBatteryFlag("batteriesMoreThan2", checked)
              }
              label=">2"
            />
          </Box>
        </FormGroup>
      </Box>
    </Box>
  );
}
