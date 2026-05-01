import express from "express";
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  addMemberToProject,
  removeMemberFromProject,
} from "../controllers/projectController.js";
import protect from "../middlewares/protect.js";
import isAdmin from "../middlewares/isAdmin.js";

const router = express.Router();

router.use(protect);

router.get("/", getProjects);
router.get("/:id", getProjectById);
router.post("/", isAdmin, createProject);
router.put("/:id", isAdmin, updateProject);
router.delete("/:id", isAdmin, deleteProject);
router.post("/:id/members", isAdmin, addMemberToProject);
router.delete("/:id/members/:userId", isAdmin, removeMemberFromProject);

export default router;
