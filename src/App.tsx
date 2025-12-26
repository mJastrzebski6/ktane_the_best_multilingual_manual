import { Box } from "@mui/material";
import { useAppStore } from "./store/AppStore";
import { LeftNav } from "./components/LeftNav";
import { viewMap } from "./views/viewMap";

export default function App() {
  const activeView = useAppStore((s) => s.activeView);

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      <LeftNav />

      <Box sx={{ flex: 1, p: 2 }}>{viewMap[activeView]}</Box>
    </Box>
  );
}
