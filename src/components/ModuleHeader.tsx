import * as React from "react";
import { Box, Button, Tooltip, IconButton, Typography } from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { useAppStore } from "../store/AppStore";

type ModuleHeaderProps = {
  title: string;
  onReset?: () => void;
  requiredData?: string[];
  helpText?: string;
};

export default function ModuleHeader({
  title,
  onReset,
  requiredData,
  helpText,
}: ModuleHeaderProps) {
  const noSelectSx = {
    userSelect: "none",
    WebkitUserSelect: "none",
    MozUserSelect: "none",
    msUserSelect: "none",
  } as const;

  const preventMouseDownSelect = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  const uiCommon = useAppStore((s) => s.t?.ui?.common) as
    | { reset?: string; requiredPrefix?: string; infoAria?: string }
    | undefined;

  const requiredText =
    requiredData && requiredData.length > 0
      ? `${uiCommon?.requiredPrefix ?? "POTRZEBNE"}: ${requiredData.join(", ")}`
      : null;

  return (
    <Box
      onMouseDown={preventMouseDownSelect}
      sx={{
        ...noSelectSx,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        mb: 3,
        width: "100%",
      }}
    >
      {/* LEWA STRONA */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          minWidth: 0,
        }}
      >
        {onReset && (
          <Button
            variant="contained"
            color="error"
            onClick={onReset}
            sx={{ height: 36 }}
          >
            {uiCommon?.reset ?? "Reset"}
          </Button>
        )}

        <Typography
          variant="h5"
          sx={{
            whiteSpace: "nowrap",
            lineHeight: 1,
          }}
        >
          {title}
        </Typography>

        {requiredText && (
          <Typography
            variant="body1"
            sx={{
              color: "error.main",
              fontWeight: 800,
              letterSpacing: 0.3,
              whiteSpace: "nowrap",
            }}
          >
            {requiredText}
          </Typography>
        )}
      </Box>

      {/* PRAWA STRONA */}
      {helpText && (
        <Box sx={{ flexShrink: 0 }} onMouseDown={preventMouseDownSelect}>
          <Tooltip
            arrow
            placement="bottom-end"
            enterDelay={150}
            title={
              <Box
                sx={{
                  maxWidth: 520,
                  whiteSpace: "pre-wrap",
                  fontSize: 13,
                  lineHeight: 1.45,
                }}
              >
                {helpText}
              </Box>
            }
          >
            <IconButton
              size="small"
              aria-label={`${uiCommon?.infoAria ?? "Informacje"}: ${title}`}
              sx={{ height: 36, width: 36 }}
            >
              <HelpOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )}
    </Box>
  );
}
