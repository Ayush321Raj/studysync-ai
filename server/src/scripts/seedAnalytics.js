import mongoose from "mongoose";
import dotenv from "dotenv";
import { StudySession } from "../models/studySession.model.js";
import { Activity } from "../models/activity.model.js";
import { User } from "../models/user.model.js";

dotenv.config();

const seedAnalytics = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB Connected");

    // Get the first user (or create one for testing)
    let user = await User.findOne();
    if (!user) {
      console.log("❌ No user found. Please register a user first.");
      process.exit(1);
    }

    console.log(`🔍 Seeding data for user: ${user.username}`);

    // Clear existing data
    await StudySession.deleteMany({ user: user._id });
    await Activity.deleteMany({ user: user._id });
    console.log("🗑️  Cleared existing analytics data");

    // Generate study sessions for the last 30 days
    const subjects = ["Mathematics", "Physics", "Chemistry", "History", "English"];
    const sessions = [];
    const activities = [];

    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Random number of sessions per day (0-3)
      const sessionsPerDay = Math.floor(Math.random() * 4);

      for (let j = 0; j < sessionsPerDay; j++) {
        const startTime = new Date(date);
        startTime.setHours(8 + Math.floor(Math.random() * 12)); // Between 8 AM and 8 PM
        startTime.setMinutes(Math.floor(Math.random() * 60));

        const duration = 15 + Math.floor(Math.random() * 105); // 15-120 minutes
        const endTime = new Date(startTime.getTime() + duration * 60 * 1000);

        sessions.push({
          user: user._id,
          subject: subjects[Math.floor(Math.random() * subjects.length)],
          startTime,
          endTime,
          duration,
          isActive: false,
          focusLevel: 1 + Math.floor(Math.random() * 5),
          tags: ["study", "focused"],
        });

        // Create corresponding activity
        activities.push({
          user: user._id,
          type: "study_session_start",
          metadata: { subject: sessions[sessions.length - 1].subject },
          date: startTime,
        });

        activities.push({
          user: user._id,
          type: "study_session_end",
          metadata: { subject: sessions[sessions.length - 1].subject },
          duration,
          date: endTime,
        });
      }

      // Add some completed tasks
      if (sessionsPerDay > 0) {
        const tasksCompleted = Math.floor(Math.random() * 5);
        for (let k = 0; k < tasksCompleted; k++) {
          activities.push({
            user: user._id,
            type: "task_completed",
            metadata: { taskName: `Task ${k + 1}` },
            date: new Date(date.setHours(12 + k)),
          });
        }
      }
    }

    // Insert all data
    await StudySession.insertMany(sessions);
    await Activity.insertMany(activities);

    console.log(`✅ Created ${sessions.length} study sessions`);
    console.log(`✅ Created ${activities.length} activities`);
    console.log("\n🎉 Seed completed successfully!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  }
};

seedAnalytics();