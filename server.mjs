import { createServer } from "http";
import { parse } from "url";
import { readFileSync } from "fs";
import { resolve } from "path";
import next from "next";
import { Server } from "socket.io";
import { MongoClient } from "mongodb";

// Load .env.local manually before Next.js starts
try {
  const envPath = resolve(process.cwd(), ".env.local");
  const envFile = readFileSync(envPath, "utf8");
  for (const line of envFile.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
  console.log("✓ Loaded .env.local");
} catch {
  console.log("No .env.local found, using system env vars");
}

const lifecycleEvent = process.env.npm_lifecycle_event;
const explicitNodeEnv = process.env.NODE_ENV;
const dev = explicitNodeEnv
  ? explicitNodeEnv !== "production"
  : lifecycleEvent !== "start";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

process.env.NODE_ENV ??= dev ? "development" : "production";

const app = next({
  dev,
  hostname,
  port,
  webpack: dev,
});
const handle = app.getRequestHandler();

await app.prepare();

const httpServer = createServer(async (req, res) => {
  try {
    const parsedUrl = parse(req.url, true);
    await handle(req, res, parsedUrl);
  } catch (err) {
    console.error("Error occurred handling", req.url, err);
    res.statusCode = 500;
    res.end("internal server error");
  }
});

const allowedOrigins = process.env.NEXT_PUBLIC_APP_URL
  ? [process.env.NEXT_PUBLIC_APP_URL]
  : ["http://localhost:3000"];

const io = new Server(httpServer, {
  path: "/api/socket",
  addTrailingSlash: false,
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
  pingTimeout: 60000,
  pingInterval: 25000,
});

// MongoDB connection for persisting chat messages
let mongoClient = null;
let chatCollection = null;

async function initMongo() {
  if (!process.env.MONGODB_URI) {
    console.log("[chat] MongoDB not configured — messages will not persist");
    return;
  }
  try {
    mongoClient = new MongoClient(process.env.MONGODB_URI);
    await mongoClient.connect();
    const dbName = process.env.MONGODB_DB || "supertech";
    chatCollection = mongoClient.db(dbName).collection("chat_messages");
    console.log("[chat] MongoDB connected — messages will persist");
  } catch (err) {
    console.error("[chat] MongoDB connection failed:", err.message);
  }
}

async function persistMessage(room, senderName, senderRole, text) {
  if (!chatCollection) return null;
  try {
    const result = await chatCollection.insertOne({
      room,
      senderName: senderName || "Guest",
      senderRole,
      text,
      createdAt: new Date(),
    });
    return result.insertedId.toString();
  } catch (err) {
    console.error("[chat] Failed to persist message:", err.message);
    return null;
  }
}

initMongo();

// Chat rooms: "support" for customer-to-admin chat
io.on("connection", (socket) => {
  console.log(`[chat] Client connected: ${socket.id}`);

  socket.on("join", async ({ room, userName }) => {
    socket.data.userName = userName || "Guest";
    socket.data.room = room || "support";
    socket.join(socket.data.room);
    io.to(socket.data.room).emit("system", { message: `${socket.data.userName} joined the chat` });

    // Load chat history from MongoDB
    if (chatCollection) {
      try {
        const history = await chatCollection
          .find({ room: socket.data.room })
          .sort({ createdAt: 1 })
          .limit(100)
          .toArray();
        socket.emit("history", history.map((doc) => ({
          id: doc._id.toString(),
          userId: "server",
          userName: doc.senderName,
          text: doc.text,
          at: doc.createdAt.toISOString(),
        })));
      } catch (err) {
        console.error("[chat] Failed to load history:", err.message);
      }
    }
  });

  socket.on("message", async ({ text }) => {
    if (!text?.trim()) return;
    const room = socket.data.room || "support";
    const userName = socket.data.userName || "Guest";

    // Persist to MongoDB first
    const persistedId = await persistMessage(room, userName, "user", text.trim());

    const msgData = {
      id: persistedId || `${socket.id}-${Date.now()}`,
      userId: socket.id,
      userName,
      text: text.trim(),
      at: new Date().toISOString(),
    };

    io.to(room).emit("message", msgData);
  });

  socket.on("disconnect", () => {
    if (socket.data.room && socket.data.userName) {
      io.to(socket.data.room).emit("system", { message: `${socket.data.userName} left the chat` });
    }
    console.log(`[chat] Client disconnected: ${socket.id}`);
  });
});

httpServer.listen(port, () => {
  console.log(`> Ready on http://${hostname}:${port}`);
});
