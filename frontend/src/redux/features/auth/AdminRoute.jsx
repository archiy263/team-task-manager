import { Navigate, Outlet } from "react-router";
import { useSelector } from "react-redux";

// AdminRoute: Only admins can access
const AdminRoute = () => {
  const { userInfo } = useSelector((state) => state.auth);
  if (!userInfo) return <Navigate to="/login" replace />;
  if (userInfo.role !== "admin") return <Navigate to="/" replace />;
  return <Outlet />;
};

export default AdminRoute;
