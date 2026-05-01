import taskModel from "../models/Task.js";
import projectModel from "../models/Project.js";
import notificationModel from "../models/Notification.js";
import asyncHandler from "../middlewares/asyncHandler.js";

// GET all tasks
const getTasks = asyncHandler(async (req, res) => {
  const query = {};

  // Filter by project
  if (req.query.project) {
    query.project = req.query.project;
  }

  // Non-admins only see their assigned tasks
  if (req.user.role !== "admin") {
    query.assignedTo = req.user._id;
  }

  const tasks = await taskModel
    .find(query)
    .populate("assignedTo", "firstname lastname email profilePicture")
    .populate("project", "name")
    .sort({ createdAt: -1 });

  res.status(200).json(tasks);
});

// GET single task
const getTaskById = asyncHandler(async (req, res) => {
  const task = await taskModel
    .findById(req.params.id)
    .populate("assignedTo", "firstname lastname email profilePicture")
    .populate("project", "name");

  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }

  res.status(200).json(task);
});

// POST create task
const createTask = asyncHandler(async (req, res) => {
  const { title, description, status, priority, dueDate, assignedTo, project } = req.body;

  if (!title) {
    return res.status(400).json({ message: "Task title is required" });
  }

  // Verify project exists if provided
  if (project) {
    const proj = await projectModel.findById(project);
    if (!proj) {
      return res.status(404).json({ message: "Project not found" });
    }
  }

  const task = new taskModel({
    title,
    description,
    status: status || "To Do",
    priority: priority || "Medium",
    dueDate,
    assignedTo: assignedTo || req.user._id,
    project,
  });

  const newTask = await task.save();
  const populated = await newTask
    .populate("assignedTo", "firstname lastname email profilePicture")
    .then((t) => t.populate("project", "name"));

  // Notify assigned user
  if (newTask.assignedTo && newTask.assignedTo.toString() !== req.user._id.toString()) {
    await notificationModel.create({
      recipient: newTask.assignedTo,
      sender: req.user._id,
      task: newTask._id,
      type: "assigned",
      message: `You have been assigned a new task: "${newTask.title}"`,
    });
  }

  res.status(201).json(populated);
});

// PUT update task
const updateTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updatedTask = await taskModel
    .findByIdAndUpdate(id, req.body, { new: true })
    .populate("assignedTo", "firstname lastname email profilePicture")
    .populate("project", "name");

  if (!updatedTask) {
    return res.status(404).json({ message: "Task not found" });
  }

  // If status changed to "Done", notify the project owner/admin
  if (req.body.status === "Done") {
    const project = await projectModel.findById(updatedTask.project);
    if (project) {
      // If the one completing it is not the project creator, notify the creator
      if (req.user._id.toString() !== project.createdBy.toString()) {
        await notificationModel.create({
          recipient: project.createdBy,
          sender: req.user._id,
          task: updatedTask._id,
          type: "completion",
          message: `${req.user.firstname} completed the task: "${updatedTask.title}"`,
        });
      }
      // If the one completing it is an admin, notify the assignee if different
      if (req.user.role === "admin" && updatedTask.assignedTo && req.user._id.toString() !== updatedTask.assignedTo._id.toString()) {
        await notificationModel.create({
          recipient: updatedTask.assignedTo._id,
          sender: req.user._id,
          task: updatedTask._id,
          type: "completion",
          message: `Admin ${req.user.firstname} marked your task as completed: "${updatedTask.title}"`,
        });
      }
    }
  }

  res.status(200).json(updatedTask);
});

// DELETE task
const deleteTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deletedTask = await taskModel.findByIdAndDelete(id);
  if (!deletedTask) {
    return res.status(404).json({ message: "Task not found" });
  }
  res.status(200).json({ message: "Task deleted successfully" });
});

// PUT reorder/bulk update tasks statuses
const reorderTasks = asyncHandler(async (req, res) => {
  const { tasks } = req.body;
  for (let task of tasks) {
    const oldTask = await taskModel.findById(task.id);
    const updated = await taskModel.findByIdAndUpdate(task.id, { status: task.status }, { new: true }).populate("project");
    
    if (oldTask.status !== "Done" && task.status === "Done") {
      const project = await projectModel.findById(updated.project);
      if (project && req.user._id.toString() !== project.createdBy.toString()) {
        await notificationModel.create({
          recipient: project.createdBy,
          sender: req.user._id,
          task: updated._id,
          type: "completion",
          message: `${req.user.firstname} completed the task: "${updated.title}"`,
        });
      }
    }
  }
  res.status(200).json({ message: "Tasks reordered successfully" });
});

export { getTasks, getTaskById, createTask, updateTask, deleteTask, reorderTasks };
