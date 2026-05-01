import projectModel from "../models/Project.js";
import taskModel from "../models/Task.js";
import asyncHandler from "../middlewares/asyncHandler.js";

// GET all projects (admin sees all, member sees only their projects)
const getProjects = asyncHandler(async (req, res) => {
  let projects;
  if (req.user.role === "admin") {
    projects = await projectModel
      .find()
      .populate("members", "firstname lastname email profilePicture role")
      .populate("createdBy", "firstname lastname email")
      .sort({ createdAt: -1 });
  } else {
    projects = await projectModel
      .find({ members: req.user._id })
      .populate("members", "firstname lastname email profilePicture role")
      .populate("createdBy", "firstname lastname email")
      .sort({ createdAt: -1 });
  }
  res.status(200).json(projects);
});

// GET single project by ID
const getProjectById = asyncHandler(async (req, res) => {
  const project = await projectModel
    .findById(req.params.id)
    .populate("members", "firstname lastname email profilePicture role")
    .populate("createdBy", "firstname lastname email");

  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  const isMember = project.members.some(
    (m) => m._id.toString() === req.user._id.toString()
  );
  const isCreator = project.createdBy._id.toString() === req.user._id.toString();

  if (req.user.role !== "admin" && !isMember && !isCreator) {
    return res.status(403).json({ message: "Access denied" });
  }

  res.status(200).json(project);
});

// POST create project (admin only)
const createProject = asyncHandler(async (req, res) => {
  const { name, description, members } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Project name is required" });
  }

  const project = new projectModel({
    name,
    description,
    members: members || [],
    createdBy: req.user._id,
  });

  const savedProject = await project.save();
  const populated = await savedProject.populate(
    "members",
    "firstname lastname email profilePicture role"
  );
  res.status(201).json(populated);
});

// PUT update project (admin only)
const updateProject = asyncHandler(async (req, res) => {
  const project = await projectModel.findById(req.params.id);
  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  const { name, description, members } = req.body;
  if (name) project.name = name;
  if (description !== undefined) project.description = description;
  if (members) project.members = members;

  const updated = await project.save();
  const populated = await updated.populate(
    "members",
    "firstname lastname email profilePicture role"
  );
  res.status(200).json(populated);
});

// DELETE project (admin only)
const deleteProject = asyncHandler(async (req, res) => {
  const project = await projectModel.findById(req.params.id);
  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }
  await taskModel.deleteMany({ project: req.params.id });
  await project.deleteOne();
  res.status(200).json({ message: "Project and its tasks deleted successfully" });
});

// POST add member to project (admin only)
const addMemberToProject = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  const project = await projectModel.findById(req.params.id);
  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }
  if (project.members.includes(userId)) {
    return res.status(400).json({ message: "User already a member" });
  }
  project.members.push(userId);
  await project.save();
  const populated = await project.populate(
    "members",
    "firstname lastname email profilePicture role"
  );
  res.status(200).json(populated);
});

// DELETE remove member from project (admin only)
const removeMemberFromProject = asyncHandler(async (req, res) => {
  const project = await projectModel.findById(req.params.id);
  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }
  project.members = project.members.filter(
    (m) => m.toString() !== req.params.userId
  );
  await project.save();
  const populated = await project.populate(
    "members",
    "firstname lastname email profilePicture role"
  );
  res.status(200).json(populated);
});

export {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  addMemberToProject,
  removeMemberFromProject,
};
