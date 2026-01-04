import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";
import { useState } from "react";

const SaveRequestDialog = ({
  open,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState("");

  const handleSave = () => {
    onSave(name);
    setName("");
  };

  const handleClose = () => {
    setName("");
    onClose();
  };

  return (
    <Dialog maxWidth={"sm"} fullWidth   open={open} onClose={handleClose}>
      <DialogTitle>Save Request</DialogTitle>

      <DialogContent sx={{margin:"10px"}}>
        <TextField
          autoFocus
          fullWidth
          label="Request Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={!name.trim()}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SaveRequestDialog;
