import dotenv from "dotenv";
import { app } from "./app.js";
import connectDB from "./config/db.js";

// Load env vars FIRST (before anything else)
dotenv.config({ path: "./.env" });

const PORT = process.env.PORT || 8000;

// Start the server only after DB connects
connectDB()
  .then(() => {
    app.on("error", (error) => {
      console.error("❌ Express error:", error);
      throw error;
    });

    app.listen(PORT, () => {
      console.log(`⚡ Server running on http://localhost:${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err);
    process.exit(1);
  });

/* ---------------------------------------
   GRACEFUL SHUTDOWN
--------------------------------------- */
process.on("unhandledRejection", (err) => {
  console.error("🔥 UNHANDLED REJECTION:", err);
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  console.error("🔥 UNCAUGHT EXCEPTION:", err);
  process.exit(1);
});