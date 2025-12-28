import Typography from "@mui/material/Typography";
import ModuleHeader from "../components/ModuleHeader";

export default function WireHorizontal() {
  return (
    <>
      <ModuleHeader
        title="Wires Horizontal"
        requiredData={["PARZYSTOŚĆ NUMERU SERYJNEGO"]}
      />

      <Typography variant="h1" sx={{ ml: 2, color: "red" }}>
        TODO
      </Typography>
    </>
  );
}
