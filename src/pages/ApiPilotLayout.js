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
import { Trash2 } from "lucide-react";
import { useState } from "react";
import apiUrl from "../config";

export default function ApiPilotLayout({request , setRequest}) {
  const { method, url, headers, body } = request;
  const [response, setResponse] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

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

      const res = await fetch(`${apiUrl}/api/request/send`, {
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
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography fontWeight={600}>Response</Typography>
                    <Button size="small" sx={{backgroundColor:"green" , color:"white"}}> Save </Button>
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
                <Button fullWidth variant="contained">
                  History
                </Button>
                <Button fullWidth variant="text">
                  Saved
                </Button>
              </Box>

              <Divider />

              <Box mt={3} textAlign="center" color="text.secondary">
                No history yet.
                <br />
                Send a request to get started.
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
