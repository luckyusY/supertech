import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
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

const io = new Server(httpServer, {
  path: "/api/socket",
  addTrailingSlash: false,
  cors: { origin: "*", methods: ["GET", "POST"] },
  transports: ["polling", "websocket"],
});

// Chat rooms: "support" for customer-to-admin chat
io.on("connection", (socket) => {
  socket.on("join", ({ room, userName }) => {
    socket.data.userName = userName || "Guest";
    socket.data.room = room || "support";
    socket.join(socket.data.room);
    io.to(socket.data.room).emit("system", { message: `${socket.data.userName} joined the chat` });
  });

  socket.on("message", ({ text }) => {
    if (!text?.trim()) return;
    io.to(socket.data.room || "support").emit("message", {
      id: `${socket.id}-${Date.now()}`,
      userId: socket.id,
      userName: socket.data.userName || "Guest",
      text: text.trim(),
      at: new Date().toISOString(),
    });
  });

  socket.on("disconnect", () => {
    if (socket.data.room && socket.data.userName) {
      io.to(socket.data.room).emit("system", { message: `${socket.data.userName} left the chat` });
    }
  });
});

httpServer.listen(port, () => {
  console.log(`> Ready on http://${hostname}:${port}`);
});
