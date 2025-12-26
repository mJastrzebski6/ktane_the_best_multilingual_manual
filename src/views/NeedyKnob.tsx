import KnobSolution from "../images/Knob/KnobSolution.png";
import { Box, Typography } from "@mui/material";

export default function NeedyKnob() {
  return (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "center", // pionowe wyśrodkowanie
          justifyContent: "flex-start",
          mb: 1,
        }}
      >
        <Typography
          variant="h5"
          sx={{ ml: 2 }} // lekki lewy margines
        >
          Wires VENN
        </Typography>
      </Box>

      <Box
        component="img"
        src={KnobSolution}
        sx={{
          width: 800,
          maxWidth: "100%",
          height: "auto",
        }}
      />
    </>
  );
}
