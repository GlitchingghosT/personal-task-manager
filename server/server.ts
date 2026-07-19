import mongoose from "mongoose";
import app from "./app";
import type { Server } from "node:http";

let httpServer: Server | undefined;

async function shutdown(signal: string) {
  console.log(`Received ${signal}; shutting down.`);
  const forceShutdown = setTimeout(() => {
    console.error("Graceful shutdown timed out");
    httpServer?.closeAllConnections();
    process.exit(1);
  }, 10_000);
  forceShutdown.unref();

  try {
    if (httpServer) {
      await new Promise<void>((resolve, reject) => {
        httpServer?.close((error) => (error ? reject(error) : resolve()));
      });
    }
    await mongoose.disconnect();
    clearTimeout(forceShutdown);
    process.exit(0);
  } catch {
    clearTimeout(forceShutdown);
    console.error("Graceful shutdown failed");
    process.exit(1);
  }
}

async function start() {
  const mongoUri = process.env.MONGO_URI;
  const jwtSecret = process.env.JWT_SECRET;
  if (!mongoUri) throw new Error("MONGO_URI environment variable is required");
  if (!jwtSecret || jwtSecret.length < 32) {
    throw new Error("JWT_SECRET must be at least 32 characters");
  }

  await mongoose.connect(mongoUri);
  const port = Number(process.env.PORT ?? 2100);
  httpServer = app.listen(port, () => console.log(`TaskDuty API listening on port ${port}`));

  process.once("SIGTERM", () => void shutdown("SIGTERM"));
  process.once("SIGINT", () => void shutdown("SIGINT"));
}

start().catch(() => {
  console.error("Failed to start server. Check database and environment configuration.");
  process.exit(1);
});
