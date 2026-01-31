import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  IconButton,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from "@mui/material";

import Grid from "@mui/material/Grid";
import { Delete, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import config from "../config/config";
import axiosInstance from "../util/axiosInstance";
import SaveRequestDialog from "./SaveRequestDialog";

export default function ApiPilotLayout({ request, setRequest }) {
  const { method, url, headers, body } = request;
  const [response, setResponse] = useState(null);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState("history");
  const [savedRequests, setSavedRequests] = useState([]);
  const [openSaveDialog, setOpenSaveDialog] = useState(false);

  const fetchSavedRequests = async () => {
    try {
      const res = await axiosInstance.get(`/api/history`);
      setSavedRequests(res.data || []);
    } catch (err) {
      console.error("Failed to fetch saved requests", err);
    }
  };

  const handleSaveRequest = async (name) => {
    try {
      await axiosInstance.post(`/api/history`, {
        name,
        request: {
          method: request.method,
          url: request.url,
          headers: request.headers,
          body: request.body,
        },
        response,
      });

      setOpenSaveDialog(false);
    } catch (err) {
      console.error("Failed to save request", err);
    }
  };

  const updateHistory = (entry) => {
    const newHistory = [entry, ...history];
    setHistory(newHistory);
    localStorage.setItem("api-history", JSON.stringify(newHistory));
  };

  const sendRequest = async () => {

    try {
      let jsonBody = null;
      if (["POST", "PUT", "PATCH"].includes(method)) {
        jsonBody = JSON.parse(body);
      }

      const res = await fetch(`${config.API_BASE_URL}/api/request/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          url,
          method,
          headers: headers
            .filter((h) => h.key.trim() !== "")
            .reduce((acc, h) => ({ ...acc, [h.key]: h.value }), {}),
          body: jsonBody,
        }),
      });

      const text = await res.text();
      let jsonParsed;
      try {
        jsonParsed = JSON.parse(text);
      } catch {
        jsonParsed = text;
      }

      const result = {
        status: jsonParsed.status,
        time: jsonParsed.responseTime,
        size: jsonParsed.size,
        headers: jsonParsed.headers,
        body: jsonParsed.data,
      };

      setResponse(result);

      updateHistory({
        method,
        url,
        headers,
        body,
        response: result,
        timestamp: new Date().toLocaleString(),
      });
    } catch (e) {
      setResponse({ error: e.message });
    }

  };
  const loadSavedItem = (item) => {
    setRequest({
      method: item.request.method,
      url: item.request.url,
      headers: item.request.headers,
      body: item.request.body || "",
    });
    setResponse(item.response);
  };

  const loadHistoryItem = (item) => {
    setRequest({
      method: item.method,
      url: item.url,
      headers:
        item.headers && item.headers.length > 0
          ? item.headers
          : [{ key: "", value: "" }],
      body: item.body || "",
    });
    if (item.response) {
      setResponse(item.response);
    }
  };

  const deleteHistoryItem = (index) => {
    const updated = history.filter((_, i) => i !== index);
    setHistory(updated);
    localStorage.setItem("api-history", JSON.stringify(updated));
  };

  const deleteSavedItem = async (id) => {
    try {
      await axiosInstance.delete(`/api/history/${id}`);
      setSavedRequests(savedRequests.filter((item) => item._id !== id));
    } catch (err) {
      console.error("Failed to delete saved request", err);
    }
  };

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("api-history")) || [];
    setHistory(stored);
  }, []);

  return (
    <Box p={2} sx={{ minWidth: "100vw", minHeight: "100vh" }}>
      <Grid container spacing={2} p={2}>
        {/* Request Builder */}
        <Grid size={{ xs: 12, md: 12, lg: 5 }}>
          <Card>
            <CardContent>
              <Typography fontWeight={600} mb={2}>
                Request Builder
              </Typography>

              <Box display="flex" gap={1} mb={2}>
                <Select
                  size="small"
                  value={method}
                  onChange={(e) =>
                    setRequest({ ...request, method: e.target.value })
                  }
                >
                  {"GET POST PUT PATCH DELETE".split(" ").map((m) => (
                    <MenuItem key={m} value={m}>
                      {m}
                    </MenuItem>
                  ))}
                </Select>

                <TextField
                  size="small"
                  fullWidth
                  value={url}
                  onChange={(e) =>
                    setRequest({ ...request, url: e.target.value })
                  }
                  placeholder="https://api.example.com/endpoint"
                />
              </Box>

              <Box
                mb={1}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography fontSize={14}>Headers</Typography>

                <Typography
                  fontSize={14}
                  sx={{ cursor: "pointer" }}
                  onClick={() =>
                    setRequest({
                      ...request,
                      headers: [...headers, { key: "", value: "" }],
                    })
                  }
                >
                  + Add Header
                </Typography>
              </Box>

              {headers.map((h, i) => (
                <Box key={i} display="flex" gap={1} mb={1}>
                  <TextField
                    size="small"
                    placeholder="Key"
                    fullWidth
                    value={h.key}
                    onChange={(e) => {
                      const copy = [...headers];
                      copy[i].key = e.target.value;
                      setRequest({ ...request, headers: copy });
                    }}
                  />
                  <TextField
                    size="small"
                    placeholder="Value"
                    fullWidth
                    value={h.value}
                    onChange={(e) => {
                      const copy = [...headers];
                      copy[i].value = e.target.value;
                      setRequest({ ...request, headers: copy });
                    }}
                  />

                  <IconButton
                    onClick={() =>
                      setRequest({
                        ...request,
                        headers: headers.filter((_, idx) => idx !== i),
                      })
                    }
                  >
                    <Trash2 />
                  </IconButton>
                </Box>
              ))}

              <Typography fontSize={14} mt={2} mb={1}>
                JSON Body
              </Typography>

              <TextField
                multiline
                rows={5}
                fullWidth
                value={body}
                onChange={(e) =>
                  setRequest({ ...request, body: e.target.value })
                }
                placeholder={`{\n  "key": "value"\n}`}
              />

              <Button
                fullWidth
                variant="contained"
                sx={{ mt: 2 }}
                onClick={sendRequest}
              >
                Send Request
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Response */}
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography fontWeight={600}>Response</Typography>
                <Button
                  size="small"
                  sx={{ backgroundColor: "green", color: "white" }}
                  disabled={!response}
                  onClick={() => setOpenSaveDialog(true)}
                >
                  Save
                </Button>
              </Box>
              <Divider sx={{ my: 2 }} />

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
                <Box
                  height="100%"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  color="text.secondary"
                >
                  Send a request to see the response
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Requests */}
        <Grid size={{ xs: 12, md: 6, lg: 3 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography fontWeight={600}>Requests</Typography>

              <Box display="flex" mt={2} mb={2}>
                <Button
                  fullWidth
                  variant={activeTab === "history" ? "contained" : "text"}
                  onClick={() => setActiveTab("history")}
                >
                  History
                </Button>

                <Button
                  fullWidth
                  variant={activeTab === "saved" ? "contained" : "text"}
                  onClick={() => {
                    setActiveTab("saved");
                    fetchSavedRequests();
                  }}
                >
                  Saved
                </Button>
              </Box>

              <Divider />

              <Box mt={2} maxHeight={500} overflow="auto">
                {/* ---------------- HISTORY ---------------- */}
                {activeTab === "history" &&
                  (history.length === 0 ? (
                    <Typography textAlign="center" color="text.secondary">
                      No history yet.
                      <br />
                      Send a request to get started.
                    </Typography>
                  ) : (
                    history.map((item, index) => (
                      <Paper key={index} sx={{ p: 1, mb: 1 }}>
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Typography fontWeight="bold">
                            {item.method}
                          </Typography>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => deleteHistoryItem(index)}
                          >
                            <Delete />
                          </IconButton>
                        </Box>

                        <Typography variant="body2">{item.url}</Typography>
                        <Typography variant="caption">
                          {item.timestamp}
                        </Typography>

                        <Button
                          size="small"
                          onClick={() => loadHistoryItem(item)}
                        >
                          Load
                        </Button>
                      </Paper>
                    ))
                  ))}

                {/* ---------------- SAVED ---------------- */}
                {activeTab === "saved" &&
                  (savedRequests.length === 0 ? (
                    <Typography textAlign="center" color="text.secondary">
                      No saved requests.
                    </Typography>
                  ) : (
                    savedRequests.map((item) => (
                      <Paper key={item._id} sx={{ p: 1, mb: 1 }}>
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Typography fontWeight="bold">{item.name}</Typography>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => deleteSavedItem(item._id)}
                          >
                            <Delete />
                          </IconButton>
                        </Box>

                        <Typography variant="body2">
                          {item.request.method}
                        </Typography>
                        <Typography variant="body2">
                          {item.request.url}
                        </Typography>

                        <Button
                          size="small"
                          onClick={() => loadSavedItem(item)}
                        >
                          Load
                        </Button>
                      </Paper>
                    ))
                  ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <SaveRequestDialog
        open={openSaveDialog}
        onClose={() => setOpenSaveDialog(false)}
        onSave={handleSaveRequest}
      />
    </Box>
  );
}
