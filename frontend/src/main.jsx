import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { createRoutesFromElements, Route, RouterProvider } from "react-router";
import { createBrowserRouter } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Projects from "./pages/Projects.jsx";
import Admin from "./pages/Admin.jsx";
import store from "./redux/store.js";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import axios from "axios";
import RequireAuth from "./redux/features/auth/RequireAuth.jsx";
import NonAuthenticatedUser from "./redux/features/auth/NonAuthenticatedUser.jsx";
import AdminRoute from "./redux/features/auth/AdminRoute.jsx";

axios.defaults.withCredentials = true;

// Add a request interceptor to attach the Bearer token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const queryClient = new QueryClient({});

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      {/* Public routes (redirect to / if already logged in) */}
      <Route path="" element={<NonAuthenticatedUser />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Route>

      {/* Protected routes (require login) */}
      <Route path="" element={<RequireAuth />}>
        <Route index={true} path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/projects" element={<Projects />} />
      </Route>

      {/* Admin-only routes */}
      <Route path="" element={<AdminRoute />}>
        <Route path="/admin" element={<Admin />} />
      </Route>
    </Route>
  )
);

import { ThemeProvider } from "./context/ThemeContext.jsx";
import { NotificationProvider } from "./context/NotificationContext.jsx";

createRoot(document.getElementById("root")).render(
  <QueryClientProvider client={queryClient}>
    <ReactQueryDevtools initialIsOpen={false} />
    <Provider store={store}>
      <ThemeProvider>
        <NotificationProvider>
          <RouterProvider router={router} />
        </NotificationProvider>
      </ThemeProvider>
    </Provider>
  </QueryClientProvider>
);
