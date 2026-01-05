import { Navigate, Outlet } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { loginSuccess } from "./redux/authSlice";
import config from "./config/config";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

const ProtectedLayout = () => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get(`${config.API_BASE_URL}/auth/authenticate`,{ withCredentials: true });

        if (res.data && res.data.authenticate === true) {
          setAuthenticated(true);
          dispatch(loginSuccess(res.data.user));
        }
      } catch (err) {
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress sx={{ color: "#5b5fff" }} />
      </Box>
    );
}

  if (!authenticated) return <Navigate to="/signin" replace />;

  return <Outlet />;
};

export default ProtectedLayout;
