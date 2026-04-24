import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import Pushpin from "./Pushpin";
import { formatDisplayName } from "../../utils/formatDisplayName";

interface SheetFrameProps {
  children: ReactNode;
  width?: number | string;
}

export function SheetFrame({ children, width = 340 }: SheetFrameProps) {
  return (
    <Box sx={{ position: "relative", width }}>
      <Pushpin color="#4a7c59" />
      <Box
        sx={{
          bgcolor: "#f8f6f0",
          p: 3,
          boxShadow: "0 3px 10px rgba(0,0,0,0.2)",
          backgroundImage:
            "repeating-linear-gradient(transparent, transparent 27px, #e8e4da 27px, #e8e4da 28px)",
          backgroundPosition: "0 48px",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

interface SheetHeaderProps {
  title: string;
  detectiveName: string;
  forensicScientistLabel: string;
}

export function SheetHeader({
  title,
  detectiveName,
  forensicScientistLabel,
}: SheetHeaderProps) {
  return (
    <>
      <Typography
        sx={{
          fontFamily: "var(--font-typewriter)",
          fontSize: "1.4rem",
          letterSpacing: "2px",
          textTransform: "uppercase",
          color: "var(--text-color)",
          textAlign: "center",
          mb: 0.5,
        }}
      >
        {title}
      </Typography>

      <Box sx={{ textAlign: "center", mb: 2 }}>
        <Typography
          component="span"
          title={detectiveName}
          sx={{
            fontFamily: "var(--font-script)",
            fontSize: "1.75em",
            fontWeight: "bold",
            color: "var(--evidence-color)",
            display: "inline-block",
            width: "100%",
            lineHeight: 1,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {formatDisplayName(detectiveName)}
        </Typography>
        <Box
          sx={{
            borderTop: "1px dashed var(--text-color)",
            mt: -1,
            mx: "auto",
            width: "60%",
          }}
        />
        <Typography
          sx={{
            fontFamily: "var(--font-typewriter)",
            fontSize: "0.8rem",
            letterSpacing: "1px",
            color: "#5f6c7b",
            fontWeight: "bold",
          }}
        >
          {forensicScientistLabel}
        </Typography>
      </Box>
    </>
  );
}

interface GluedNoteProps {
  rotation: number;
  zIndex: number;
  children: ReactNode;
}

export function AnalysisValue({ value }: { value: string }) {
  return (
    <Typography
      component="span"
      sx={{
        fontFamily: "var(--font-script)",
        fontWeight: "bold",
        fontSize: "1.4rem",
        lineHeight: 1,
        textTransform: "uppercase",
        color: "var(--evidence-color)",
      }}
    >
      {value}
    </Typography>
  );
}

export function AnalysisTitle({ index, title }: { index: number; title: string }) {
  return (
    <Typography
      sx={{
        fontFamily: "var(--font-typewriter)",
        fontSize: "1rem",
        color: "var(--text-color)",
      }}
    >
      {index + 1}. {title}
    </Typography>
  );
}

interface FillableSlotProps {
  value: string;
  options: string[];
  onChange: (v: string) => void;
  disabled?: boolean;
}

export function FillableSlot({ value, options, onChange, disabled }: FillableSlotProps) {
  return (
    <Select
      variant="standard"
      disableUnderline
      value={value}
      onChange={(e) => onChange(e.target.value as string)}
      displayEmpty
      fullWidth
      disabled={disabled}
      IconComponent={KeyboardArrowDownIcon}
      sx={{
        width: "100%",
        "& .MuiSelect-select": {
          width: "100%",
          boxSizing: "border-box",
          fontFamily: "var(--font-script)",
          fontWeight: "bold",
          fontSize: "1.4rem",
          lineHeight: 1,
          textTransform: "uppercase",
          color: "var(--evidence-color)",
          borderBottom: "2px dashed var(--evidence-color)",
          pt: 0,
          pb: 0.5,
          pr: "28px !important",
          minHeight: "1.4em",
        },
        "& .MuiSelect-icon": {
          color: "var(--evidence-color)",
        },
      }}
      renderValue={(v) => (
        <Box
          component="span"
          sx={{
            display: "inline-flex",
            alignItems: "center",
            minHeight: "1.4em",
          }}
        >
          {v ? <AnalysisValue value={v as string} /> : <>&nbsp;</>}
        </Box>
      )}
    >
      {options.map((opt) => (
        <MenuItem key={opt} value={opt} sx={{ fontFamily: "var(--font-typewriter)" }}>
          {opt}
        </MenuItem>
      ))}
    </Select>
  );
}

interface SlotRowProps {
  index: number;
  title: string;
  value: string;
  locked?: boolean;
  options: string[];
  onChange: (v: string) => void;
  disabled?: boolean;
}

export function SlotRow({ index, title, value, locked, options, onChange, disabled }: SlotRowProps) {
  if (locked) {
    return (
      <Box>
        <Typography
          component="span"
          sx={{
            fontFamily: "var(--font-typewriter)",
            fontSize: "1rem",
            color: "var(--text-color)",
          }}
        >
          {index + 1}. {title}{" "}
        </Typography>
        <AnalysisValue value={value} />
      </Box>
    );
  }
  return (
    <Box>
      <AnalysisTitle index={index} title={title} />
      <FillableSlot value={value} options={options} onChange={onChange} disabled={disabled} />
    </Box>
  );
}

export function GluedNote({ rotation, zIndex, children }: GluedNoteProps) {
  return (
    <Box
      sx={{
        position: "relative",
        mt: -2,
        mx: 1,
        transform: `rotate(${rotation}deg)`,
        zIndex,
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: -4,
          left: "50%",
          transform: "translateX(-50%)",
          width: "4em",
          height: "1.2em",
          background: "rgba(255, 245, 180, 0.5)",
          boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.15)",
          zIndex: 2,
        }}
      />
      <Box
        sx={{
          bgcolor: "#faf5e8",
          p: 2,
          boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
