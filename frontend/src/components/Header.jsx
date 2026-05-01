import axios from "axios";
import { BiTask } from "react-icons/bi";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logout } from "../redux/features/auth/authSlice";
import {
  LayoutDashboard,
  Folder,
  Shield,
  LogOut,
  LogIn,
  UserPlus,
} from "lucide-react";

const baseURL = import.meta.env.VITE_BACKEND_BASE_URL || "http://localhost:3000";

const logoutUser = async () => {
  const { data } = await axios.post(`${baseURL}/api/v1/user/logout`);
  return data;
};

const NavLink = ({ to, icon: Icon, children, active }) => (
  <Link
    to={to}
    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
      active
        ? "bg-white/20 text-white shadow-sm backdrop-blur-sm"
        : "text-indigo-100 hover:bg-white/10 hover:text-white"
    }`}
  >
    <Icon size={16} className={active ? "text-white" : "text-indigo-200"} />
    {children}
  </Link>
);

import { Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import NotificationBell from "./NotificationBell";

const Header = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const userInfo = useSelector((state) => state.auth.userInfo);
  const { theme, toggleTheme } = useTheme();

  const mutation = useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      dispatch(logout());
      queryClient.setQueryData(["user"]);
      toast.success("Logout successful");
      navigate("/login");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "An error occurred");
    },
  });

  const isActive = (path) => location.pathname === path;

  return (
    <header className={`sticky top-0 z-40 border-b transition-colors duration-300 ${
      theme === "dark" 
        ? "bg-slate-900 border-slate-800" 
        : "bg-gradient-to-r from-indigo-800 via-indigo-700 to-purple-800 border-indigo-500/30 shadow-lg"
    }`}>
      <div className="max-w-7xl mx-auto flex justify-between items-center px-5 py-3">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2 text-white group">
          <div className="p-1.5 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
            <BiTask className="text-2xl text-indigo-100 group-hover:text-white" />
          </div>
          <span className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-200">
            TeamTasks
          </span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-2">
          {userInfo?.email ? (
            <>
              <NavLink to="/dashboard" icon={LayoutDashboard} active={isActive("/dashboard")}>
                Dashboard
              </NavLink>
              <NavLink to="/" icon={BiTask} active={isActive("/")}>
                Tasks
              </NavLink>
              <NavLink to="/projects" icon={Folder} active={isActive("/projects")}>
                Projects
              </NavLink>
              {userInfo?.role === "admin" && (
                <NavLink to="/admin" icon={Shield} active={isActive("/admin")}>
                  Admin
                </NavLink>
              )}

              {/* Theme Toggle & User */}
              <div className="flex items-center gap-3 ml-2 pl-4 border-l border-indigo-400/30 dark:border-slate-700">
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all duration-200 group"
                  title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
                >
                  {theme === "dark" ? (
                    <Sun size={18} className="text-yellow-400 group-hover:rotate-45 transition-transform" />
                  ) : (
                    <Moon size={18} className="text-indigo-200 group-hover:-rotate-12 transition-transform" />
                  )}
                </button>

                <NotificationBell />

                <div className="flex items-center gap-2">
                  <img
                    src={userInfo?.profilePicture}
                    alt={userInfo?.firstname}
                    className="w-8 h-8 rounded-full object-cover border-2 border-indigo-200 dark:border-slate-700 shadow-sm"
                  />
                  <div className="hidden md:flex flex-col">
                    <span className="text-white text-sm font-semibold leading-none">
                      {userInfo?.firstname}
                    </span>
                    {userInfo?.role === "admin" && (
                      <span className="text-[10px] text-purple-200 dark:text-slate-400 font-medium tracking-wide uppercase mt-0.5">
                        Admin
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => mutation.mutate()}
                  className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-red-500/90 hover:bg-red-500 text-white font-medium transition-all duration-200 shadow-sm hover:shadow hover:-translate-y-0.5 ml-1"
                >
                  <LogOut size={14} /> Logout
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="p-2 mr-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all duration-200"
              >
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <NavLink to="/login" icon={LogIn} active={isActive("/login")}>
                Login
              </NavLink>
              <NavLink to="/signup" icon={UserPlus} active={isActive("/signup")}>
                Sign Up
              </NavLink>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
