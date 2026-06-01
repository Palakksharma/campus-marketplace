import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
        <h3>Loading...</h3>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return <Navigate to="/signin" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
