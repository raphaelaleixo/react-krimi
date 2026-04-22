import { forwardRef } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useI18n } from "../../hooks/useI18n";

interface PassNoteProps {
  rotation: number;
  fullWidth?: boolean;
}

const PassNote = forwardRef<HTMLDivElement, PassNoteProps>(function PassNote(
  { rotation, fullWidth = false },
  ref,
) {
  const { t } = useI18n();
  const width = fullWidth ? "90%" : 200;
  return (
    <Box
      ref={ref}
      sx={{
        width,
        transform: `rotate(${rotation}deg)`,
      }}
    >
      <Box
        sx={{
          bgcolor: "#fef3a0",
          width: "100%",
          p: 2,
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
          filter: "sepia(0.05)",
        }}
      >
        <Typography
          sx={{
            fontFamily: "var(--font-script)",
            fontSize: "1.25rem",
            fontWeight: "bold",
            lineHeight: 1.1,
            color: "var(--text-color)",
            textAlign: "center",
          }}
        >
          {t("Passed")}
        </Typography>
      </Box>
    </Box>
  );
});

export default PassNote;
