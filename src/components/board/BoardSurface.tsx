import Box from "@mui/material/Box";
import type { ReactNode } from "react";

export default function BoardSurface({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        position: "relative",
        minHeight: "100dvh",
        color: "#f5efe3",
        overflowX: "clip",
      }}
    >
      <Box sx={{ position: "relative", zIndex: 1 }}>{children}</Box>
    </Box>
  );
}
