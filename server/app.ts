import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import mongoose from "mongoose";
import authRouter from "./routes/authRouter";
import taskRouter from "./routes/taskRouter";
import { ApiError, errorHandler } from "./middleware/errorHandler";

dotenv.config({ quiet: true });

const app = express();
const configuredClientOrigin = process.env.CLIENT_ORIGIN;
if (process.env.NODE_ENV === "production" && !configuredClientOrigin) {
  throw new Error("CLIENT_ORIGIN environment variable is required in production");
}
const clientOrigin = configuredClientOrigin ?? "http://localhost:5173";

app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(helmet());
app.use(cors({ origin: clientOrigin }));
app.use(express.json({ limit: "100kb" }));

app.get("/api/health", (_req, res) => {
  const databaseReady = mongoose.connection.readyState === 1;
  res.status(databaseReady ? 200 : 503).json({ status: databaseReady ? "ok" : "unavailable" });
});

app.use("/api/auth", authRouter);
app.use("/api/tasks", taskRouter);

app.use((_req, _res, next) => {
  next(new ApiError(404, "NOT_FOUND", "Resource not found."));
});
app.use(errorHandler);

export default app;
