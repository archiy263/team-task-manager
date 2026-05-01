import cron from "node-cron";
import taskModel from "../models/Task.js";
import notificationModel from "../models/Notification.js";

const startCronJob = () => {
  // Run every day at 00:00 (Midnight)
  cron.schedule("0 0 * * *", async () => {
    console.log("Running Daily Deadline Check...");
    try {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // 1. Find tasks due within 24 hours
      const upcomingTasks = await taskModel.find({
        status: { $ne: "Done" },
        dueDate: { $gte: now, $lte: tomorrow },
      });

      for (let task of upcomingTasks) {
        // Avoid duplicate notifications (simple check)
        const exists = await notificationModel.findOne({
          recipient: task.assignedTo,
          task: task._id,
          type: "deadline",
          createdAt: { $gte: new Date(now.setHours(0,0,0,0)) }
        });

        if (!exists && task.assignedTo) {
          await notificationModel.create({
            recipient: task.assignedTo,
            task: task._id,
            type: "deadline",
            message: `Reminder: Task "${task.title}" is due soon (within 24 hours)!`,
          });
        }
      }

      // 2. Find overdue tasks (Pending)
      const overdueTasks = await taskModel.find({
        status: { $ne: "Done" },
        dueDate: { $lt: now },
      });

      for (let task of overdueTasks) {
        if (task.assignedTo) {
          // Check if already notified today
          const exists = await notificationModel.findOne({
            recipient: task.assignedTo,
            task: task._id,
            type: "pending",
            createdAt: { $gte: new Date(now.setHours(0,0,0,0)) }
          });

          if (!exists) {
            await notificationModel.create({
              recipient: task.assignedTo,
              task: task._id,
              type: "pending",
              message: `Task Overdue: "${task.title}" is currently pending and past its deadline.`,
            });
          }
        }
      }
    } catch (err) {
      console.error("Cron Job Error:", err);
    }
  });
  
  console.log("Notification Cron Job Initialized");
};

export default startCronJob;
