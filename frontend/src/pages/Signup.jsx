import { useForm } from "react-hook-form";
import Input from "../components/Input";
import Button from "../components/Button";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { setCredentials } from "../redux/features/auth/authSlice";
import { useDispatch } from "react-redux";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import OAuth from "../components/OAuth";
import { BiTask } from "react-icons/bi";
import { UserPlus } from "lucide-react";

const baseURL = import.meta.env.VITE_BACKEND_BASE_URL || "http://localhost:3000";

const createUser = async (userData) => {
  const { data } = await axios.post(`${baseURL}/api/v1/user/signup`, userData);
  return data;
};

const signupSchema = z
  .object({
    firstname: z.string().min(1, "First name is required"),
    lastname: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z
      .string()
      .min(8, "Confirm password must be at least 8 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

function Signup() {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      firstname: "",
      lastname: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    resolver: zodResolver(signupSchema),
  });

  const mutation = useMutation({
    mutationFn: createUser,
    onSuccess: (data) => {
      // Dispatch the user data to Redux store
      dispatch(setCredentials(data));
      queryClient.setQueryData(["user"], data);
      toast.success("Signup successful");
      navigate("/");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "An error occurred during signup"
      );
    },
  });

  const signup = (data) => {
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
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-slate-100 mt-4">Create your account</h2>
          <p className="text-gray-500 dark:text-slate-400 mt-2 text-sm">Join your team and start managing tasks</p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-gray-100 dark:border-slate-800 overflow-hidden">
          <form onSubmit={handleSubmit(signup)}>
            <div className="p-7 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 mb-1.5 block uppercase tracking-wide">First Name</label>
                  <Input placeholder="John" {...register("firstname")} />
                  {errors.firstname && (
                    <p className="text-red-500 text-xs mt-[-8px] mb-1">{errors.firstname.message}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 mb-1.5 block uppercase tracking-wide">Last Name</label>
                  <Input placeholder="Doe" {...register("lastname")} />
                  {errors.lastname && (
                    <p className="text-red-500 text-xs mt-[-8px] mb-1">{errors.lastname.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 mb-1.5 block uppercase tracking-wide">Email Address</label>
                <Input placeholder="you@example.com" type="email" {...register("email")} />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-[-8px] mb-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 mb-1.5 block uppercase tracking-wide">Password</label>
                <Input
                  type="password"
                  placeholder="Min 8 characters"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-red-500 text-xs mt-[-8px] mb-1">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 mb-1.5 block uppercase tracking-wide">Confirm Password</label>
                <Input
                  type="password"
                  placeholder="Re-enter your password"
                  {...register("confirmPassword")}
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-[-8px] mb-1">{errors.confirmPassword.message}</p>
                )}
              </div>

              <Button
                textColor="text-white"
                type="submit"
                className="w-full flex items-center justify-center gap-2"
                disabled={isSubmitting}
              >
                <UserPlus size={18} />
                {isSubmitting ? "Creating account..." : "Create Account"}
              </Button>

              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-slate-800"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white dark:bg-slate-900 px-3 text-gray-400 dark:text-slate-500 font-medium transition-colors">or continue with</span>
                </div>
              </div>

              <OAuth title={"Signup with Google"} />
            </div>

            <div className="bg-gray-50 dark:bg-slate-800/50 px-7 py-4 border-t border-gray-100 dark:border-slate-800 transition-colors">
              <p className="text-center text-sm text-gray-500 dark:text-slate-400">
                Already have an account?{" "}
                <Link to="/login" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Signup;
