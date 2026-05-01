import notificationModel from "../models/Notification.js";
import asyncHandler from "../middlewares/asyncHandler.js";

// GET notifications for logged in user
const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await notificationModel
    .find({ recipient: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50);

  res.status(200).json(notifications);
});

// PUT mark notification as read
const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const notification = await notificationModel.findByIdAndUpdate(
    id,
    { isRead: true },
    { new: true }
  );

  if (!notification) {
    return res.status(404).json({ message: "Notification not found" });
  }

  res.status(200).json(notification);
});

// PUT mark all as read
const markAllAsRead = asyncHandler(async (req, res) => {
  await notificationModel.updateMany(
    { recipient: req.user._id, isRead: false },
    { isRead: true }
  );

  res.status(200).json({ message: "All notifications marked as read" });
});

// DELETE notification
const deleteNotification = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await notificationModel.findByIdAndDelete(id);
  res.status(200).json({ message: "Notification deleted" });
});

export { getNotifications, markAsRead, markAllAsRead, deleteNotification };
