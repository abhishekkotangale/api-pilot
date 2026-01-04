
import CloseIcon from "@mui/icons-material/Close";
import {
    Box,
    Button,
    Dialog,
    DialogContent,
    IconButton,
    TextField,
    Typography,
} from "@mui/material";
import { useState } from "react";
import apiUrl from "../config";
import axios from "axios";

export default function AiRequestAssistantDialog({
  open,
  onClose,
  onGenerate,
}) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);



const handleGenerate = async () => {
  if (!input.trim()) return;

  setLoading(true);

  try {
    const res = await axios.post(
      `${apiUrl}/ai/generate`,
      { prompt: input }
    );

    onGenerate(res.data);
    setInput("");
    onClose();
  } catch (e) {
    console.error(e);
    alert("AI could not generate a valid request");
  }

  setLoading(false);
};


  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogContent>
        <Box display="flex" justifyContent="space-between">
          <Typography fontWeight={600}>✨ AI Request Assistant</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Typography fontSize={14} color="text.secondary" mt={1} mb={2}>
          Describe the API request you want to make.
        </Typography>

        <TextField
          multiline
          rows={4}
          fullWidth
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Example: GET all users from JSONPlaceholder"
        />

        <Box display="flex" justifyContent="flex-end" mt={3} gap={2}>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            variant="contained"
            disabled={loading}
            onClick={handleGenerate}
          >
            {loading ? "Thinking..." : "✨ Generate"}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
