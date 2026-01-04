import {
  Box,
  Button,
  Divider,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { Plane } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginSuccess } from "../redux/authSlice";
import { useDispatch } from "react-redux";
import config from "../config/config";

const SignIn = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    console.log(e);
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const res = await axios.post(`${config.API_BASE_URL}/auth/login`, form, {
        withCredentials: true,
      });
      debugger;

      if (res.data.success) {
        dispatch(loginSuccess(res.data.user));
        navigate("/");
      }
    } catch (err) {
      alert("Invalid credentials!");
    }
  };

  const handleGoogleSuccess = async (cred) => {
    try {
      const res = await axios.post(
        `${config.API_BASE_URL}/auth/auth/google`,
        { token: cred.credential },
        { withCredentials: true }
      );
      if (res.data.success) {
        dispatch(loginSuccess(res.data.user)); 
        navigate("/");
      }
    } catch (err) {
      alert("Google login failed");
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
          Welcome back
        </Typography>
        <Typography sx={{ color: "#6b7280", mb: 3 }}>
          Sign in to your account to continue
        </Typography>

        <Box sx={{ textAlign: "left", mb: 2 }}>
          <Typography sx={{ fontWeight: 600, mb: 0.5 }}>Email</Typography>
          <TextField
            name="email"
            fullWidth
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

        <Box sx={{ textAlign: "left", mb: 3 }}>
          <Typography sx={{ fontWeight: 600, mb: 0.5 }}>Password</Typography>
          <TextField
            name="password"
            fullWidth
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
          Sign In
        </Button>

        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Divider sx={{ flexGrow: 1 }} />
          <Typography sx={{ px: 2, color: "#6b7280", fontSize: "0.875rem" }}>
            OR
          </Typography>
          <Divider sx={{ flexGrow: 1 }} />
        </Box>

        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => alert("Google Login Failed")}
        />

        <Typography mt={2} textAlign="center">
          Don’t have an account?{" "}
          <span
            style={{ cursor: "pointer", color: "#1976d2" }}
            onClick={() => navigate("/signup")}
          >
            Sign Up
          </span>
        </Typography>
      </Paper>
    </Box>
  );
};

export default SignIn;
