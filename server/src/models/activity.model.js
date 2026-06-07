import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        "login",
        "logout",
        "study_session_start",
        "study_session_end",
        "task_completed",
        "task_created",
        "file_uploaded",
        "profile_updated",
      ],
      required: true,
      index: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    duration: {
      type: Number, // in minutes
      default: 0,
    },
    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient queries
activitySchema.index({ user: 1, date: -1 });
activitySchema.index({ user: 1, type: 1, date: -1 });

export const Activity = mongoose.model("Activity", activitySchema);