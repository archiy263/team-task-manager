import express from "express";
import {
  signupUser,
  loginUser,
  logoutUser,
  getMe,
  google,
} from "../controllers/userController.js";
import protect from "../middlewares/protect.js";

const router = express.Router();

router.route("/signup").post(signupUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/google", google);
router.get("/me", protect, getMe);

export default router;
