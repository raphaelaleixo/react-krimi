import Box from "@mui/material/Box";
import ButtonBase, { type ButtonBaseProps } from "@mui/material/ButtonBase";
import { forwardRef } from "react";

export type PinnedNoteProps = ButtonBaseProps & {
  rotation?: number;
  to?: string;
  href?: string;
};

const PinnedNote = forwardRef<HTMLButtonElement, PinnedNoteProps>(
  function PinnedNote({ rotation = 0, children, sx, ...rest }, ref) {
    return (
      <ButtonBase
        ref={ref}
        disableRipple
        sx={{
          position: "relative",
          display: "inline-flex",
          width: 190,
          minHeight: 60,
          color: "#1C1B1B",
          transform: `rotate(${rotation}deg)`,
          transition: "transform 300ms ease",
          overflow: "visible",
          "& .pn-paper": {
            position: "relative",
            zIndex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flex: 1,
            bgcolor: "#fff",
            color: "#3A7085",
            overflow: "hidden",
            px: 2,
            py: 1.5,
            fontFamily: "var(--font-script)",
            textTransform: "uppercase",
            fontSize: "1.5rem",
            fontWeight: 400,
            WebkitTextStroke: "0.3px currentColor",
            textAlign: "center",
            whiteSpace: "nowrap",
            boxShadow: "0 8px 22px rgba(0,0,0,0.3)",
            transition:
              "border-radius 300ms ease, box-shadow 300ms ease",
            "&::before": {
              content: '""',
              position: "absolute",
              inset: 0,
              backgroundImage:
                "linear-gradient(160deg, rgba(0,0,0,0) 50%, rgba(0,0,0,0.2) 100%)",
              transform: "translate(100%, 100%)",
              transition: "transform 300ms ease",
              pointerEvents: "none",
            },
          },
          "& .pn-tape": {
            position: "absolute",
            top: -14,
            left: "50%",
            transform: "translateX(-50%)",
            width: "4em",
            height: "1.2em",
            background: "rgba(255, 245, 180, 0.5)",
            boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.15)",
            zIndex: 2,
            pointerEvents: "none",
          },
          "&:hover": {
            transform: `rotate(${rotation}deg) translateY(-2px)`,
            "& .pn-paper": {
              borderRadius: "0 0 22% 0 / 0 0 90% 0",
              boxShadow:
                "14px 14px 24px rgba(0,0,0,0.35), 0 8px 22px rgba(0,0,0,0.25)",
              "&::before": {
                transform: "translate(0, 0)",
              },
            },
          },
          "@media (prefers-reduced-motion: reduce)": {
            transition: "none",
            "&:hover": {
              transform: `rotate(${rotation}deg)`,
              "& .pn-paper": { borderRadius: 0 },
            },
          },
          ...sx,
        }}
        {...rest}
      >
        <Box className="pn-paper">{children}</Box>
        <Box className="pn-tape" />
      </ButtonBase>
    );
  },
);

export default PinnedNote;
