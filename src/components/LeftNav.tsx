import { Box, MenuItem, Select, Typography } from "@mui/material";
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

export function LeftNav() {
  const { setActiveView, lang, setLang, availableLangs } = useAppStore();

  return (
    <Box
      sx={{
        width: 280,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid #ddd",
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

      {/* NAV GRID */}
      <Box
        sx={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gridAutoRows: 90,
          gap: 1,
          p: 1,
          overflowY: "auto",
        }}
      >
        {items.map((item) => (
          <Box
            key={item.id}
            onClick={() => setActiveView(item.id)}
            sx={{
              cursor: "pointer",
              overflow: "hidden",
              "&:hover": { opacity: 0.8 },
            }}
          >
            <img
              src={item.img}
              alt={item.id}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
}
