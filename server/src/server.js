import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/db.js";

// Load env vars FIRST
dotenv.config({ path: "./.env" });

const PORT = process.env.PORT || 8000;

// ─── Boot Sequence ─────────────────────────────────────
const startServer = async () => {
  try {
    await connectDB();

    app.on("error", (error) => {
      console.error("❌ Express Error:", error);
      throw error;
    });

    app.listen(PORT, () => {
      console.log(`⚡ Server running on http://localhost:${PORT}`);
      console.log(`📡 Health check: http://localhost:${PORT}/api/v1/health`);
    });
  } catch (error) {
    console.error("❌ Server startup failed:", error);
    process.exit(1);
  }
};

startServer();

// ─── Graceful Shutdown ─────────────────────────────────
process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err);
  process.exit(1);
});