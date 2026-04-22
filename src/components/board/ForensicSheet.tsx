import { useMemo } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useI18n } from "../../hooks/useI18n";
import type { AnalysisItem } from "../../data/analysis";
import { GluedNote, SheetFrame, SheetHeader } from "./forensicSheetParts";
import { ROUND_1_COUNT, randomRotation } from "./forensicSheetConfig";

interface ForensicSheetProps {
  detectiveName: string;
  analysis: AnalysisItem[];
  forensicAnalysis?: string[];
}

function AnalysisLine({
  index,
  title,
  value,
}: {
  index: number;
  title: string;
  value: string;
}) {
  return (
    <>
      <Typography
        component="span"
        sx={{
          fontWeight: "bold",
          fontFamily: "var(--font-typewriter)",
          fontSize: "1rem",
          color: "var(--text-color)",
        }}
      >
        {index + 1}. {title}:{" "}
      </Typography>
      <Typography
        component="span"
        sx={{
          fontFamily: "var(--font-script)",
          fontWeight: "bold",
          fontSize: "1.4rem",
          textTransform: "uppercase",
          color: "var(--evidence-color)",
        }}
      >
        {value}
      </Typography>
    </>
  );
}

export default function ForensicSheet({
  detectiveName,
  analysis,
  forensicAnalysis,
}: ForensicSheetProps) {
  const { t } = useI18n();
  const gluedNoteRotations = useMemo(() => {
    if (!forensicAnalysis) return [];
    return forensicAnalysis.slice(ROUND_1_COUNT).map(() => randomRotation());
  }, [forensicAnalysis]);

  if (!forensicAnalysis || forensicAnalysis.length === 0) return null;

  const round1Items = forensicAnalysis.slice(0, ROUND_1_COUNT);
  const laterItems = forensicAnalysis.slice(ROUND_1_COUNT);

  return (
    <Box sx={{ position: "relative", width: 340 }}>
      <SheetFrame>
        <SheetHeader
          title={t("Forensic Analysis")}
          detectiveName={detectiveName}
          forensicScientistLabel={t("Forensic Scientist")}
        />

        {round1Items.map((item, index) => (
          <Box key={index} sx={{ mb: 1.5 }}>
            <AnalysisLine
              index={index}
              title={analysis[index]?.title ?? ""}
              value={item}
            />
          </Box>
        ))}
      </SheetFrame>

      {laterItems.map((item, i) => {
        const index = ROUND_1_COUNT + i;
        const rotation = gluedNoteRotations[i] || 0;
        return (
          <GluedNote key={index} rotation={rotation} zIndex={1 + i}>
            <AnalysisLine
              index={index}
              title={analysis[index]?.title ?? ""}
              value={item}
            />
          </GluedNote>
        );
      })}
    </Box>
  );
}
