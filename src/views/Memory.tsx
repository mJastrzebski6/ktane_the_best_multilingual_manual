import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ModuleHeader from "../components/ModuleHeader";

export default function Memory() {
  return (
    <Box>
      <ModuleHeader title="Memory" />

      <Typography variant="h1" sx={{ ml: 2, color: "red" }}>
        TODO
      </Typography>
    </Box>
  );
}
