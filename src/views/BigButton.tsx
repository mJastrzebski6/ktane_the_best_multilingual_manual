import BigButtonSolution from "../images/BigButton/BigButtonSolution.png";
import { Box, Typography } from "@mui/material";

export default function BigButton() {
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
          BigButton
        </Typography>
      </Box>

  <Typography
          variant="h1"
          sx={{ ml: 2, color:"red" }} 
        >
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
