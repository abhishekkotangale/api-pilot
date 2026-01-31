import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { loginSuccess } from "./redux/authSlice";
import axiosInstance from "./util/axiosInstance";

const ProtectedLayout = () => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        axiosInstance.defaults.headers.common["Authorization"] = localStorage.getItem("token");
        const res = await axiosInstance.get(`/auth/authenticate`);

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
