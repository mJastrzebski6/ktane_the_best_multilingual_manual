import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export default function WireHorizontal() {
  return <>
  <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          mb: 1,
          gap: 2,
        }}
      >
        <Typography variant="h5" sx={{ ml: 2 }}>
          Wires Horizontal
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.75, color: "red"}}>
          POTRZEBNE: PARZYSTOŚĆ NUMERU SERYJNEGO
        </Typography>
      </Box>

        <Typography
          variant="h1"
          sx={{ ml: 2, color:"red" }} 
        >
          TODO
        </Typography>
      
      </>
}
