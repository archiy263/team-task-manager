import taskModel from "../models/Task.js";
import projectModel from "../models/Project.js";
import userModel from "../models/User.js";
import asyncHandler from "../middlewares/asyncHandler.js";

const getDashboardStats = asyncHandler(async (req, res) => {
  const isAdmin = req.user.role === "admin";

  let taskQuery = {};
  let projectQuery = {};

  if (!isAdmin) {
    taskQuery = { assignedTo: req.user._id };
    projectQuery = { members: req.user._id };
  }

  const [
    totalTasks,
    todoTasks,
    inProgressTasks,
    doneTasks,
    totalProjects,
    totalUsers,
    highPriorityTasks,
    overdueTasks,
    recentTasks,
    upcomingDeadlines,
  ] = await Promise.all([
    taskModel.countDocuments(taskQuery),
    taskModel.countDocuments({ ...taskQuery, status: "To Do" }),
    taskModel.countDocuments({ ...taskQuery, status: "In Progress" }),
    taskModel.countDocuments({ ...taskQuery, status: "Done" }),
    projectModel.countDocuments(projectQuery),
    isAdmin ? userModel.countDocuments() : Promise.resolve(null),
    taskModel.countDocuments({ ...taskQuery, priority: "High", status: { $ne: "Done" } }),
    taskModel.countDocuments({ ...taskQuery, dueDate: { $lt: new Date() }, status: { $ne: "Done" } }),
    taskModel
      .find(taskQuery)
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("assignedTo", "firstname lastname email profilePicture")
      .populate("project", "name"),
    taskModel
      .find({
        ...taskQuery,
        dueDate: { $gte: new Date(), $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
        status: { $ne: "Done" },
      })
      .sort({ dueDate: 1 })
      .limit(5)
      .populate("assignedTo", "firstname lastname email profilePicture")
      .populate("project", "name"),
  ]);

  res.status(200).json({
    stats: {
      totalTasks,
      todoTasks,
      inProgressTasks,
      doneTasks,
      totalProjects,
      totalUsers,
      highPriorityTasks,
      overdueTasks,
    },
    recentTasks,
    upcomingDeadlines,
  });
});

export { getDashboardStats };
