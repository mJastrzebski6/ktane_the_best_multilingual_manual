import KnobSolution from "../images/Knob/KnobSolution.png";
import { Box } from "@mui/material";
import ModuleHeader from "../components/ModuleHeader";

export default function NeedyKnob() {
  return (
    <Box>
      <ModuleHeader title="Needy Knob" />

      <Box
        component="img"
        src={KnobSolution}
        alt="Needy Knob solution"
        sx={{
          width: 800,
          maxWidth: "100%",
          height: "auto",
        }}
      />
    </Box>
  );
}
