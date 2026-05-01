import express from "express";
import { getAllUsers, updateUserRole, deleteUser } from "../controllers/adminController.js";
import isAdmin from "../middlewares/isAdmin.js";

const router = express.Router();

router.use(isAdmin);

router.get("/users", getAllUsers);
router.put("/users/:id/role", updateUserRole);
router.delete("/users/:id", deleteUser);

export default router;
