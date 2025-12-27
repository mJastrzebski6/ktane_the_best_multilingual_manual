import { Box } from "@mui/material";
import { useAppStore } from "./store/AppStore";
import { LeftNav } from "./components/LeftNav";
import { viewMap } from "./views/viewMap";
import { useEffect } from "react";
import { preloadImages } from "./preloadImages";
import { KeypadImageById } from "./views/KeypadImages";

export default function App() {
  const activeView = useAppStore((s) => s.activeView);

  useEffect(() => {
    // start preloading ASAP
    void preloadImages(Object.values(KeypadImageById));
  }, []);

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      <LeftNav />

      <Box sx={{ flex: 1, p: 2 }}>{viewMap[activeView]}</Box>
    </Box>
  );
}
