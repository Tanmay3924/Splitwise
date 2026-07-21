import { Navigate, Outlet } from "react-router-dom";
import Loading from "./Loading";
import { useApp } from "../context/AppContext";

function ProtectedRoute() {
  const { user, loading } = useApp();
  if (loading) {
    return <Loading />; // later replace with spinner
  }

  if (!user) {
    return <Navigate to="/login" replace={true} />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
