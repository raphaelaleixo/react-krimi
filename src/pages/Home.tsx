import { useCallback, useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import { HostDeviceWarningModal, isLikelyMobileHost } from "react-gameroom";
import { useGame } from "../contexts/GameContext";
import { useI18n } from "../hooks/useI18n";
import BoardSurface from "../components/board/BoardSurface";
import CaseFile from "../components/board/CaseFile";
import PinnedNote from "../components/board/PinnedNote";
import StampButton from "../components/board/StampButton";
import logo from "../assets/logo.svg";
import ludoratory from "../assets/ludoratory.svg";

export default function Home() {
  const navigate = useNavigate();
  const { createRoom } = useGame();
  const { t, lang, setLang } = useI18n();
  const [hostWarningOpen, setHostWarningOpen] = useState(false);

  const createAndGo = useCallback(async () => {
    const roomId = await createRoom(lang);
    navigate(`/room/${roomId}`);
  }, [createRoom, lang, navigate]);

  const startCreate = useCallback(() => {
    if (isLikelyMobileHost()) {
      setHostWarningOpen(true);
      return;
    }
    void createAndGo();
  }, [createAndGo]);

  const toggleLocale = useCallback(
    () => setLang(lang === "pt_br" ? "en" : "pt_br"),
    [lang, setLang],
  );

  return (
    <BoardSurface>
      <Container
        maxWidth="sm"
        sx={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}
      >
        <Box
          component="main"
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            py: 6,
          }}
        >
          <CaseFile maxWidth="none">
            <Box sx={{ textAlign: "center" }}>
              <Box
                component="img"
                src={logo}
                sx={{ width: 96, mx: "auto", mb: 2, display: "block" }}
                alt="Krimi"
              />
              <Typography
                component="h1"
                sx={{
                  fontFamily: 'var(--font-typewriter)',
                  fontSize: { xs: "1rem", sm: "1.1rem" },
                  fontWeight: "normal",
                  color: "#1C1B1B",
                  lineHeight: 1.7,
                  mb: 3,
                }}
              >
                <Box
                  component="span"
                  sx={{
                    textTransform: "uppercase",
                    letterSpacing: "2px",
                    fontWeight: 700,
                  }}
                >
                  {t("A game of deception")}.
                </Box>{" "}
                {t("A web-version of Tobey Ho's")}{" "}
                <strong>Deception: Murder in Hong Kong</strong>.
              </Typography>
              <StampButton variant="primary" onClick={startCreate}>
                {t("New game")}
              </StampButton>
            </Box>
          </CaseFile>

          <Box
            sx={{
              display: "flex",
              gap: 3,
              justifyContent: "center",
              flexWrap: "wrap",
              mt: -7,
              position: "relative",
              zIndex: 2,
            }}
          >
            <PinnedNote rotation={-3} component={RouterLink} to="/join">
              {t("Join game")}
            </PinnedNote>
            <PinnedNote rotation={2.5} component={RouterLink} to="/how-to-play">
              {t("How to play")}
            </PinnedNote>
          </Box>
        </Box>

        <Box
          component="footer"
          sx={{
            py: 2,
            display: "flex",
            alignItems: "center",
            gap: 2,
            color: "#fff",
            fontSize: "0.75em",
            flexWrap: "wrap",
          }}
        >
          <Box
            component="img"
            src={ludoratory}
            sx={{ width: 32, filter: "brightness(0) invert(1)" }}
            alt="Ludoratory"
          />
          <Box sx={{ flex: 1, minWidth: 180 }}>
            <Typography
              variant="body2"
              sx={{ fontSize: "0.75rem", lineHeight: 1.4 }}
            >
              {t("Made by")}{" "}
              <Link
                href="https://aleixo.me"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ color: "inherit", textDecorationColor: "inherit" }}
              >
                Raphael Aleixo / Ludoratory
              </Link>
              .
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontSize: "0.75rem", lineHeight: 1.4 }}
            >
              {t("Licensed under")}{" "}
              <Link
                href="https://creativecommons.org/licenses/by-nc-sa/4.0/"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ color: "inherit", textDecorationColor: "inherit" }}
              >
                CC BY-NC-SA 4.0
              </Link>
              .
            </Typography>
          </Box>
          <StampButton
            variant="text"
            onClick={toggleLocale}
            sx={{ fontSize: "0.7rem", letterSpacing: "2px" }}
          >
            {t("Versão em português")}
          </StampButton>
        </Box>
      </Container>

      <HostDeviceWarningModal
        open={hostWarningOpen}
        onConfirm={() => {
          setHostWarningOpen(false);
          void createAndGo();
        }}
        onCancel={() => setHostWarningOpen(false)}
        labels={{
          title: t("Heads up"),
          body: t(
            "You're about to host on what looks like a phone. The host screen works best on a larger display — a laptop or tablet.",
          ),
          confirmLabel: t("Host anyway"),
          cancelLabel: t("Cancel"),
        }}
      />
    </BoardSurface>
  );
}
