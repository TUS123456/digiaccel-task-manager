import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import taskRoutes from "./routes/taskRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Connect to the DB on demand. On Vercel every cold start is a fresh process,
// so we connect per request and reuse the connection if it already exists.
app.use("/api", async (_req, res, next) => {
  try {
    const ok = await connectDB();
    if (!ok && process.env.VERCEL) {
      return res.status(500).json({ error: "Database connection failed" });
    }
    next();
  } catch (err) {
    console.error("DB Init Error:", err);
    res.status(500).json({ error: "Database connection failed" });
  }
});

// Health check endpoint
app.get("/api/health", (_req, res) => {
  const isDbUsed =
    process.env.DB_USED === "true" || process.env.db_used === "true";
  res.json({
    status: "online",
    app: "Digiaccel Task Manager Backend (MVC)",
    storageMode: isDbUsed
      ? "MongoDB Database (db_used=true)"
      : "File Directory tasks.json (db_used=false)",
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use("/api", taskRoutes);

export default app;
