import Box from "@mui/material/Box";
import type { ReactNode } from "react";
import CoffeeStains from "./CoffeeStains";

export default function BoardSurface({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        position: "relative",
        minHeight: "100dvh",
        color: "#f5efe3",
        overflow: "hidden",
      }}
    >
      <Box sx={{ position: "relative", zIndex: 1 }}>{children}</Box>
    </Box>
  );
}
