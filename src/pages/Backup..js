import {
  Box,
  Button,
  Divider,
  IconButton,
  MenuItem,
  Modal,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";

import DarkModeIcon from "@mui/icons-material/DarkMode";
import DeleteIcon from "@mui/icons-material/Delete";
import LightModeIcon from "@mui/icons-material/LightMode";
import LogoutIcon from "@mui/icons-material/Logout";
import SmartToyIcon from "@mui/icons-material/SmartToy";

import { GoogleGenAI } from "@google/genai";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import axios from "axios";
import { Delete } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ApiRequestTool() {
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("");
  const [headers, setHeaders] = useState([{ key: "", value: "" }]);
  const [body, setBody] = useState("{}");
  const [response, setResponse] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const ai = new GoogleGenAI({
    apiKey: "AIzaSyCExwAa1TpZZbQsSUoDNU-nVr4Z24QjBkE",
  });

  // Theme
  const [theme, setTheme] = useState("light");

  // AI Popup State
  const [aiOpen, setAiOpen] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const muiTheme = createTheme({
    palette: {
      mode: theme,
    },
  });

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/history`);
      setHistory(res.data);
    } catch (error) {}
  };

  const updateHistory = (entry) => {
    const newHistory = [entry, ...history];
    setHistory(newHistory);
    localStorage.setItem("api-history", JSON.stringify(newHistory));
  };

  const sendRequest = async () => {
    setLoading(true);

    try {
      let jsonBody = null;
      if (["POST", "PUT", "PATCH"].includes(method)) {
        jsonBody = JSON.parse(body);
      }

      const start = performance.now();

      const res = await fetch("http://localhost:5000/api/request/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url,
          method,
          headers: headers
            .filter((h) => h.key.trim() !== "")
            .reduce((acc, h) => ({ ...acc, [h.key]: h.value }), {}),
          body: jsonBody,
        }),
      });

      const end = performance.now();

      const text = await res.text();
      let jsonParsed;
      try {
        jsonParsed = JSON.parse(text);
      } catch {
        jsonParsed = text;
      }

      const result = {
        status: res.status,
        time: Math.round(end - start),
        size: text.length,
        headers: Object.fromEntries(res.headers.entries()),
        body: jsonParsed,
      };

      setResponse(result);

      updateHistory({
        method,
        url,
        headers,
        body,
        timestamp: new Date().toLocaleString(),
      });
    } catch (e) {
      setResponse({ error: e.message });
    }

    setLoading(false);
  };

  // ---------- AI FEATURE ----------
  const handleAiProcess = async () => {
    setAiLoading(true);

    try {
      const aiRes = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `
                  Extract API request details. Return ONLY valid JSON with:
                  - method
                  - url
                  - headers
                  - body

                  STRICT: Do not use code blocks or markdown.
                  `,
              },
              { text: aiInput },
            ],
          },
        ],
      });

      //

      let text = aiRes.candidates[0].content.parts[0].text;

      // Cleanup code blocks (if any)
      text = text.replace(/```json|```/g, "").trim();

      // Parse JSON
      const parsed = JSON.parse(text);

      if (parsed.method) setMethod(parsed.method);
      if (parsed.url) setUrl(parsed.url);
      if (parsed.headers)
        setHeaders(
          Object.entries(parsed.headers).map(([k, v]) => ({
            key: k,
            value: v,
          }))
        );
      if (parsed.body) setBody(JSON.stringify(parsed.body, null, 2));

      setAiOpen(false);
      setAiInput("");
    } catch (err) {
      console.error(err);
    }

    setAiLoading(false);
  };

  const loadHistoryItem = (item) => {
    setLoading(true);

    const headersArray = Object.entries(item.headers).map(([key, value]) => ({
      key,
      value,
    }));

    setMethod(item.method);
    setUrl(item.url);
    setHeaders(headersArray);
    setBody(JSON.stringify(item.body, null, 2));

    setLoading(false);
  };

  // -------- LOGOUT --------
  const handleLogout = async () => {
    try {
      await axios.get("http://localhost:5000/auth/logout", { withCredentials: true });
      navigate("/signin");
    } catch (error) {
      alert("Error logging out");
    }
  };

  const changeTheme = () =>
    theme === "light" ? <DarkModeIcon /> : <LightModeIcon />;

  const onClickChangeTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />

      {/* TOP BAR Buttons */}
      <Box
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: "flex-end",
          p: 1,
          gap: 1,
        }}
      >
        <Button
          variant="contained"
          startIcon={<SmartToyIcon />}
          onClick={() => setAiOpen(true)}
        >
          AI Assist
        </Button>

        <Button
          variant="contained"
          color="error"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Box>

      {/* AI POPUP MODAL */}
      <Modal open={aiOpen} onClose={() => setAiOpen(false)}>
        <Box
          sx={{
            width: 500,
            p: 3,
            bgcolor: "background.paper",
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            borderRadius: 2,
          }}
        >
          <Typography variant="h6">AI Request Assistant</Typography>
          <Divider sx={{ my: 1 }} />

          <TextField
            label="Describe your API request"
            fullWidth
            multiline
            rows={5}
            value={aiInput}
            onChange={(e) => setAiInput(e.target.value)}
          />

          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 2 }}
            onClick={handleAiProcess}
            disabled={aiLoading}
          >
            {aiLoading ? "Thinking..." : "Generate Request"}
          </Button>
        </Box>
      </Modal>

      {loading ? (
        <Box
          sx={{
            height: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: "24px",
            fontWeight: "bold",
          }}
        >
          Loading...
        </Box>
      ) : (
        <Box display="flex" gap={2} p={2}>
          {/* Request Builder */}
          <Paper sx={{ p: 2, width: "40%" }}>
            <Typography variant="h6">Request Builder</Typography>
            <Divider sx={{ my: 1 }} />

            <TextField
              fullWidth
              label="URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              sx={{ mb: 2 }}
            />

            <Select
              fullWidth
              value={method}
              onChange={(e) => setMethod(e.target.value)}
            >
              {"GET POST PUT PATCH DELETE".split(" ").map((m) => (
                <MenuItem key={m} value={m}>
                  {m}
                </MenuItem>
              ))}
            </Select>

            <Typography mt={2}>Headers</Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Key</TableCell>
                  <TableCell>Value</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {headers.map((h, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <TextField
                        size="small"
                        value={h.key}
                        onChange={(e) => {
                          const newHeaders = [...headers];
                          newHeaders[i].key = e.target.value;
                          setHeaders(newHeaders);
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        value={h.value}
                        onChange={(e) => {
                          const newHeaders = [...headers];
                          newHeaders[i].value = e.target.value;
                          setHeaders(newHeaders);
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() =>
                          setHeaders(headers.filter((_, idx) => idx !== i))
                        }
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Button
              sx={{ mt: 1 }}
              onClick={() => setHeaders([...headers, { key: "", value: "" }])}
            >
              + Add Header
            </Button>

            <Typography mt={2}>JSON Body</Typography>
            <TextField
              fullWidth
              multiline
              rows={8}
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />

            <Button
              variant="contained"
              fullWidth
              sx={{ mt: 2 }}
              onClick={sendRequest}
            >
              Send Request
            </Button>
          </Paper>

          {/* Response Viewer */}
          <Paper sx={{ p: 2, width: "40%" }}>
            <Typography variant="h6">Response</Typography>
            <Divider sx={{ my: 1 }} />

            {response ? (
              <Box>
                {response.error ? (
                  <Typography color="red">Error: {response.error}</Typography>
                ) : (
                  <>
                    <Typography>Status: {response.status}</Typography>
                    <Typography>Time: {response.time} ms</Typography>
                    <Typography>Size: {response.size} bytes</Typography>

                    <Typography mt={2} fontWeight="bold">
                      Body
                    </Typography>
                    <Paper sx={{ p: 1, maxHeight: 200, overflow: "auto" }}>
                      <pre>{JSON.stringify(response.body, null, 2)}</pre>
                    </Paper>

                    <Typography mt={2} fontWeight="bold">
                      Headers
                    </Typography>
                    <Paper sx={{ p: 1, maxHeight: 150, overflow: "auto" }}>
                      <pre>{JSON.stringify(response.headers, null, 2)}</pre>
                    </Paper>
                  </>
                )}
              </Box>
            ) : (
              <Typography>No response yet</Typography>
            )}
          </Paper>

          {/* History */}
          <Paper sx={{ p: 2, width: "20%" }}>
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <IconButton onClick={onClickChangeTheme}>
                {changeTheme()}
              </IconButton>
            </Box>

            <Typography variant="h6">History</Typography>
            <Divider sx={{ my: 1 }} />

            <Button
              color="error"
              fullWidth
              onClick={async () => {
                try {
                  await axios.delete(`http://localhost:5000/api/history`);
                  setHistory([]);
                } catch (err) {
                  console.error(err);
                }
              }}
            >
              Clear All
            </Button>

            <Box mt={2} maxHeight={500} overflow="auto">
              {history.map((item, index) => (
                <Paper key={index} sx={{ p: 1, mb: 1 }}>
                  <Typography fontWeight="bold">{item.method}</Typography>
                  <Typography variant="body2">{item.url}</Typography>
                  <Typography variant="caption">{item.timestamp}</Typography>

                  <Box display="flex" gap={1} mt={1}>
                    <Button size="small" onClick={() => loadHistoryItem(item)}>
                      Load
                    </Button>
                    <IconButton
                      color="error"
                      onClick={async () => {
                        try {
                          await axios.delete(
                            `http://localhost:5000/api/history/${item._id}`
                          );
                          setHistory(history.filter((h) => h._id !== item._id));
                        } catch (err) {
                          console.error(err);
                        }
                      }}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </Paper>
              ))}
            </Box>
          </Paper>
        </Box>
      )}
    </ThemeProvider>
  );
}
