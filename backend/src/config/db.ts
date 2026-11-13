import mongoose from "mongoose";
import dns from "dns";

let isConnected = false;
let connecting: Promise<boolean> | null = null;

const isVercel = !!process.env.VERCEL;

// Only needed on some local networks; not on Vercel
if (!isVercel) {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
}

export function isDbConnected(): boolean {
  return isConnected && mongoose.connection.readyState === 1;
}

export function cleanMongoUri(rawUri?: string): string {
  if (!rawUri || typeof rawUri !== "string") return "";
  return rawUri
    .trim()
    .replace(/^["']|["']$/g, "")
    .trim();
}

export function isValidMongoUri(uri?: string): boolean {
  const cleaned = cleanMongoUri(uri);
  if (!cleaned) return false;
  if (
    cleaned.includes("<username>") ||
    cleaned.includes("<db_password>") ||
    cleaned.includes("MY_MONGODB_URI") ||
    cleaned.includes("MY_GEMINI_API_KEY")
  ) {
    return false;
  }
  return (
    cleaned.startsWith("mongodb://") || cleaned.startsWith("mongodb+srv://")
  );
}

async function doConnect(): Promise<boolean> {
  const isDbRequested =
    process.env.DB_USED === "true" || process.env.db_used === "true";

  if (!isDbRequested) {
    console.log(
      "📁 [db_used=false] -> Using local File Directory storage (JSON)",
    );
    isConnected = false;
    return false;
  }

  const rawUri = process.env.MONGODB_URI;

  if (!isValidMongoUri(rawUri)) {
    console.warn(
      "⚠️ [db_used=true] requested, but MONGODB_URI is missing or invalid.",
    );
    if (!isVercel) {
      console.log("📁 Using File Directory storage (data/tasks.json).");
    }
    isConnected = false;
    return false;
  }

  try {
    console.log("🔌 [db_used=true] Connecting to MongoDB Atlas...");
    await mongoose.connect(cleanMongoUri(rawUri), {
      serverSelectionTimeoutMS: isVercel ? 8000 : 4000,
      connectTimeoutMS: isVercel ? 8000 : 4000,
    });
    isConnected = true;
    console.log("Connected to MongoDB Atlas successfully.");
    return true;
  } catch (error: any) {
    isConnected = false;
    console.warn(
      "MongoDB Atlas connection could not be established:",
      error?.message || error,
    );
    if (!isVercel) {
      console.log(
        "Seamlessly using local File Directory storage (data/tasks.json).",
      );
    }
    return false;
  }
}

export async function connectDB(): Promise<boolean> {
  // Warm function: connection already open, reuse it
  if (mongoose.connection.readyState === 1) {
    isConnected = true;
    return true;
  }

  // Several requests at once share one connection attempt
  if (!connecting) {
    connecting = doConnect().finally(() => {
      connecting = null;
    });
  }
  return connecting;
}
