import userModel from "../models/User.js";
import asyncHandler from "../middlewares/asyncHandler.js";

// GET all users
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await userModel
    .find()
    .select("-password")
    .sort({ createdAt: -1 });
  res.status(200).json(users);
});

// PUT update user role (admin only)
const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;

  if (!["admin", "member"].includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  if (req.params.id === req.user._id.toString()) {
    return res.status(400).json({ message: "Cannot change your own role" });
  }

  const user = await userModel.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true }
  ).select("-password");

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.status(200).json(user);
});

// DELETE user (admin only)
const deleteUser = asyncHandler(async (req, res) => {
  if (req.params.id === req.user._id.toString()) {
    return res.status(400).json({ message: "Cannot delete yourself" });
  }

  const user = await userModel.findByIdAndDelete(req.params.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.status(200).json({ message: "User deleted successfully" });
});

export { getAllUsers, updateUserRole, deleteUser };
