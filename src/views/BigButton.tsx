import BigButtonSolution from "../images/BigButton/BigButtonSolution.png";
import { Box, Typography } from "@mui/material";
import ModuleHeader from "../components/ModuleHeader";

export default function BigButton() {
  return (
    <>
      <ModuleHeader title="BigButton" />

      <Typography variant="h1" sx={{ color: "red" }}>
        TODO
      </Typography>

      <Box
        component="img"
        src={BigButtonSolution}
        sx={{
          width: 800,
          maxWidth: "100%",
          height: "auto",
        }}
      />
    </>
  );
}
