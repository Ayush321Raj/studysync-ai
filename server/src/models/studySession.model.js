import mongoose from "mongoose";

const studySessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    startTime: {
      type: Date,
      required: true,
      index: true,
    },
    endTime: {
      type: Date,
      validate: {
        validator: function (value) {
          // endTime can be null (active session) or must be after startTime
          return !value || value > this.startTime;
        },
        message: "End time must be after start time",
      },
    },
    duration: {
      type: Number, // in minutes
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    notes: {
      type: String,
      maxlength: 500,
    },
    focusLevel: {
      type: Number,
      min: 1,
      max: 5,
      default: 3,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Calculate duration before saving
studySessionSchema.pre("save", function (next) {
  if (this.endTime && this.startTime) {
    this.duration = Math.round((this.endTime - this.startTime) / (1000 * 60));
  }
  next();
});

// Compound indexes
studySessionSchema.index({ user: 1, startTime: -1 });
studySessionSchema.index({ user: 1, isActive: 1 });

export const StudySession = mongoose.model("StudySession", studySessionSchema);