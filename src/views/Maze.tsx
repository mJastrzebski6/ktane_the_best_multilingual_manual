import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export default function Maze() {
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
          Maze
        </Typography>
      </Box>
        <Typography
          variant="h1"
          sx={{ ml: 2, color:"red" }} 
        >
          TODO
        </Typography>
    </>
  );
}
