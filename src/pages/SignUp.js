import { Box, Button, Paper, TextField, Typography } from "@mui/material";
import axios from "axios";
import { Plane } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiUrl from "../config";

const SignUp = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const res = await axios.post(`${apiUrl}/auth/signup`, form);
      if (res.data.success) {
        alert("Account created successfully!");
        navigate("/signin");
      }
    } catch (err) {
      alert("Error creating account");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#f3f4f6",
        p: 2,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 4,
          maxWidth: 400,
          width: "100%",
          textAlign: "center",
          borderRadius: 2,
          border: "1px solid #e5e7eb",
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
          <Plane color="#5b5fff" size={"30px"}/>
          <Typography variant="h5" sx={{ ml: 1, fontWeight: 700 }}>
            API Pilot
          </Typography>
        </Box>

        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
          Create an account
        </Typography>
        <Typography sx={{ color: "#6b7280", mb: 3 }}>
          Get started with API Pilot today
        </Typography>

        <Box sx={{ textAlign: "left", mb: 2 }}>
          <Typography sx={{ fontWeight: 600, mb: 0.5 }}>Name</Typography>
          <TextField
            fullWidth
            name="name"
            placeholder="John Doe"
            value={form.name}
            onChange={handleChange}
            sx={{
              "& .MuiOutlinedInput-root": {
                bgcolor: "#f3f4f6",
                "& fieldset": { borderColor: "#e5e7eb" },
              },
            }}
          />
        </Box>

        <Box sx={{ textAlign: "left", mb: 2 }}>
          <Typography sx={{ fontWeight: 600, mb: 0.5 }}>Email</Typography>
          <TextField
            fullWidth
            name="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            sx={{
              "& .MuiOutlinedInput-root": {
                bgcolor: "#f3f4f6",
                "& fieldset": { borderColor: "#e5e7eb" },
              },
            }}
          />
        </Box>

        <Box sx={{ textAlign: "left", mb: 1 }}>
          <Typography sx={{ fontWeight: 600, mb: 0.5 }}>Password</Typography>
          <TextField
            fullWidth
            name="password"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
            sx={{
              "& .MuiOutlinedInput-root": {
                bgcolor: "#f3f4f6",
                "& fieldset": { borderColor: "#e5e7eb" },
              },
            }}
          />
        </Box>

        <Typography
          sx={{
            fontSize: "0.75rem",
            color: "#6b7280",
            mb: 3,
            textAlign: "left",
          }}
        >
          Must be at least 6 characters
        </Typography>

        <Button
          fullWidth
          variant="contained"
          onClick={handleSubmit}
          sx={{
            bgcolor: "#5b5fff",
            textTransform: "none",
            py: 1.5,
            fontWeight: 600,
            mb: 2,
            "&:hover": { bgcolor: "#4a4fcc" },
          }}
        >
          Create Account
        </Button>

        <Typography mt={2} textAlign="center">
          Already have an account?{" "}
          <span
            style={{ cursor: "pointer", color: "#1976d2" }}
            onClick={() => navigate("/signin")}
          >
            Login
          </span>
        </Typography>
      </Paper>
    </Box>
  );
};

export default SignUp;
