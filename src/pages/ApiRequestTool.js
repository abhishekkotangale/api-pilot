import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import {
  AppBar,
  Box,
  Button,
  createTheme,
  CssBaseline,
  IconButton,
  ThemeProvider,
  Toolbar,
  Typography,
} from "@mui/material";
import axios from "axios";
import { Plane } from "lucide-react";
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import AiRequestAssistantDialog from "./AiRequestAssistantDialog";
import ApiPilotLayout from "./ApiPilotLayout";
import config from "../config/config";

export default function ApiRequestTool() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("dark");
  const [aiOpen, setAiOpen] = useState(false);
  const [request, setRequest] = useState({
    method: "GET",
    url: "",
    headers: [{ key: "", value: "" }],
    body: "{}",
  });
  const user = useSelector((state) => state.auth.user);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: { main: "#7c83ff" },
          background: {
            default: mode === "dark" ? "#0b0f1a" : "#f6f7fb",
            paper: mode === "dark" ? "#11162a" : "#ffffff",
          },
        },
        shape: { borderRadius: 10 },
      }),
    [mode]
  );
  const handleAiGenerate = (data) => {
    setRequest({
      method: data.method || "GET",
      url: data.url || "",
      headers: data.headers
        ? Object.entries(data.headers).map(([k, v]) => ({
            key: k,
            value: v,
          }))
        : [{ key: "", value: "" }],
      body: data.body ? JSON.stringify(data.body, null, 2) : "{}",
    });
  };

  const handleLogout = async () => {
    try {
      await axios.get(`${config.API_BASE_URL}/auth/logout`, {
        withCredentials: true,
      });
      navigate("/signin");
    } catch (error) {
      alert("Error logging out");
    }
  };
  return (
    <ThemeProvider theme={theme}>
      <Box overflow={"hidden"}>
        <CssBaseline />
        <AppBar position="static" color="transparent" elevation={0}>
          <Toolbar>
            <Typography
              fontWeight={600}
              display="flex"
              alignItems="center"
              gap={1}
            >
              <Plane color="#5b5fff" size={30} />
              API Pilot
            </Typography>

            <Box flexGrow={1} />

            <Typography fontSize={14} mr={2}>
              {user.email}
            </Typography>

            <Button
              variant="outlined"
              size="small"
              sx={{ mr: 1 }}
              onClick={() => setAiOpen(true)}
            >
              ✨ AI Assist
            </Button>

            <IconButton
              onClick={() => setMode(mode === "dark" ? "light" : "dark")}
            >
              {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>

            <Button color="error" sx={{ ml: 1 }} onClick={handleLogout}>
              Logout
            </Button>
          </Toolbar>
        </AppBar>

        <ApiPilotLayout request={request} setRequest={setRequest} />
      </Box>

      <AiRequestAssistantDialog
        open={aiOpen}
        onClose={() => setAiOpen(false)}
        onGenerate={handleAiGenerate}
      />
    </ThemeProvider>
  );
}
