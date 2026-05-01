import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "task",
    },
    type: {
      type: String,
      enum: ["deadline", "completion", "assigned", "pending", "reminder"],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const notificationModel = mongoose.models.Notification || mongoose.model("notification", notificationSchema);

export default notificationModel;
