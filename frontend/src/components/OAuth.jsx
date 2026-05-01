/* eslint-disable react/prop-types */
import Button from "./Button";
import { app } from "../firebase";
import { useDispatch } from "react-redux";
import { setCredentials } from "../redux/features/auth/authSlice";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";

const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL || "http://localhost:3000";

const OAuth = ({ title }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleGoogleClick = async () => {
    if (!app) {
      toast.error("Google sign-in is not configured. Please use email/password.");
      return;
    }
    try {
      const { getAuth, GoogleAuthProvider, signInWithPopup } = await import("firebase/auth");
      const auth = getAuth(app);
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const resultsFromGoogle = await signInWithPopup(auth, provider);

      const res = await fetch(`${baseUrl}/api/v1/user/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: resultsFromGoogle.user.displayName,
          email: resultsFromGoogle.user.email,
          googlePhotoUrl: resultsFromGoogle.user.photoURL,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        dispatch(setCredentials(data));
        toast.success("Login successful");
        navigate("/");
      }
    } catch (error) {
      console.error(error);
      toast.error("Google sign-in failed");
    }
  };

  return (
    <button
      type="button"
      className="w-full flex items-center justify-center gap-2.5 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-md text-gray-700 font-semibold py-3 rounded-xl transition-all duration-200 text-sm shadow-sm"
      onClick={handleGoogleClick}
    >
      <img
        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
        alt="Google"
        className="w-5 h-5"
      />
      {title || "Continue with Google"}
    </button>
  );
};

export default OAuth;
