import { createServer } from "http";
import { parse } from "url";
import { readFileSync } from "fs";
import { resolve } from "path";
import next from "next";

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
  console.log("Loaded .env.local");
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

httpServer.listen(port, () => {
  console.log(`> Ready on http://${hostname}:${port}`);
});
