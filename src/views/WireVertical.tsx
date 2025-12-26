import WireVerticalSolution from "../images/Venn/VennWireComponentSolution.png";
import { Box } from "@mui/material";

export default function WireVertical() {
  return (
    <>
      <div>Wire Vertical</div>
      <Box
        component="img"
        src={WireVerticalSolution}
        sx={{
          width: 600,
          maxWidth: "100%",
          height: "auto",
        }}
      />
    </>
  );
}
