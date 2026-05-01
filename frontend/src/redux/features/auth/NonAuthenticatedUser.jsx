import { Navigate, Outlet } from "react-router";
import { useSelector } from "react-redux";

// If already logged in, redirect away from login/signup pages to home
const NonAuthenticatedUser = () => {
  const { userInfo } = useSelector((state) => state.auth);
  return userInfo ? <Navigate to="/" replace /> : <Outlet />;
};

export default NonAuthenticatedUser;
