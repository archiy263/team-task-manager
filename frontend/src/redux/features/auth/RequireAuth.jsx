import { Navigate, Outlet } from "react-router";
import { useSelector } from "react-redux";

// Protects routes that require authentication
// If not logged in → redirect to /login
const RequireAuth = () => {
  const { userInfo } = useSelector((state) => state.auth);
  return userInfo ? <Outlet /> : <Navigate to="/login" replace />;
};

export default RequireAuth;
