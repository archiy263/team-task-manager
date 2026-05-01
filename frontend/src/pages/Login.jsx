import { useForm } from "react-hook-form";
import Input from "../components/Input";
import Button from "../components/Button";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { setCredentials } from "../redux/features/auth/authSlice";
import { useDispatch } from "react-redux";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import OAuth from "../components/OAuth";
import { BiTask } from "react-icons/bi";
import { LogIn } from "lucide-react";

const baseURL = import.meta.env.VITE_BACKEND_BASE_URL || "http://localhost:3000";

const loginUser = async (userData) => {
  const { data } = await axios.post(`${baseURL}/api/v1/user/login`, userData);
  return data;
};

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password should be at least 8 characters"),
});

function Login() {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: zodResolver(loginSchema),
  });

  const mutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      dispatch(setCredentials(data));
      queryClient.setQueryData(["user"], data);
      toast.success("Login successful");
      navigate("/");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "An error occurred during login"
      );
    },
  });

  const login = (data) => {
    mutation.mutate(data);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-gray-50 via-indigo-50/30 to-purple-50/20 dark:from-slate-900 dark:via-indigo-950/20 dark:to-purple-950/20 transition-colors duration-300">
      <div className="w-full max-w-md">
        {/* Brand header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="p-2.5 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-lg">
              <BiTask className="text-2xl text-white" />
            </div>
            <span className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-purple-700 dark:from-indigo-400 dark:to-purple-400">
              TeamTasks
            </span>
          </Link>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-slate-100 mt-4">Welcome back</h2>
          <p className="text-gray-500 dark:text-slate-400 mt-2 text-sm">Sign in to your account to continue</p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-gray-100 dark:border-slate-800 overflow-hidden">
          <form onSubmit={handleSubmit(login)}>
            <div className="p-7 space-y-5">
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 mb-1.5 block uppercase tracking-wide">Email Address</label>
                <Input
                  placeholder="you@example.com"
                  type="email"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-[-8px] mb-2">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 mb-1.5 block uppercase tracking-wide">Password</label>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-red-500 text-xs mt-[-8px] mb-2">
                    {errors.password.message}
                  </p>
                )}
              </div>
              <Button
                textColor="text-white"
                type="submit"
                className="w-full flex items-center justify-center gap-2"
                disabled={isSubmitting}
              >
                <LogIn size={18} />
                {isSubmitting ? "Signing in..." : "Sign In"}
              </Button>

              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-slate-800"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white dark:bg-slate-900 px-3 text-gray-400 dark:text-slate-500 font-medium transition-colors">or continue with</span>
                </div>
              </div>

              <OAuth title={"Login with Google"} />
            </div>

            <div className="bg-gray-50 dark:bg-slate-800/50 px-7 py-4 border-t border-gray-100 dark:border-slate-800 transition-colors">
              <p className="text-center text-sm text-gray-500 dark:text-slate-400">
                Don&apos;t have an account?{" "}
                <Link to="/signup" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold transition-colors">
                  Create one
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
