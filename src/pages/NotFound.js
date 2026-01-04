import { Box, Button, Typography } from "@mui/material";
import { ArrowLeft, Home, Plane } from "lucide-react";
import { useNavigate } from "react-router-dom";
const NotFound = () => {
  const navigate = useNavigate();
  return (
    <Box
      sx={{
        fontFamily: "JetBrains Mono, monospace",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#f3f4f6",
        p: 2,
      }}
    >
      <Box sx={{ textAlign: "center" }}>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          gap={1}
          mb={4}
        >
          <Plane color="#3C83F6" sx={{ fontSize: 25 }} />
          <Typography variant="h5" fontWeight="bold" color="text.primary">
            API Pilot
          </Typography>
        </Box>

        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: "6rem", sm: "8rem" },
            fontWeight: 700,
            color: "#3C83F6",
            mb: 2,
          }}
        >
          404
        </Typography>

        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
          Page Not Found
        </Typography>

        <Typography sx={{ color: "#6b7280", mb: 4, maxWidth: 400, mx: "auto" }}>
          Looks like The page you're looking for may have been moved or deleted.
        </Typography>

        <Box
          sx={{
            display: "flex",
            gap: 2,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Button
            variant="outlined"
            startIcon={<ArrowLeft />}
            onClick={() => window.history.back()}
            sx={{
              textTransform: "none",
              borderColor: "#e5e7eb",
              color: "#1f2937",
              fontWeight: 600,
              px: 3,
              "&:hover": { borderColor: "#d1d5db", bgcolor: "#f9fafb" },
            }}
          >
            Go Back
          </Button>
          <Button
            variant="contained"
            startIcon={<Home />}
            onClick={() => navigate("/")}
            sx={{
              bgcolor: "#3C83F6",
              textTransform: "none",
              fontWeight: 600,
              px: 3,
              "&:hover": { bgcolor: "#3C83F6" },
            }}
          >
            Return Home
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default NotFound;
