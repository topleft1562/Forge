import express from "express";
import "dotenv/config.js";
import bodyParser from "body-parser";
import cors from "cors";
import mongoose from "mongoose";
import userRoutes from "./routes/user";
import coinRoutes from "./routes/coin";
import messageRoutes from "./routes/feedback";
import coinTradeRoutes from "./routes/coinTradeRoutes";
import chartRoutes from "./routes/chart";
import { init } from "./db/dbConncetion";
import { logger } from "./sockets/logger";
import corsConfig from "./config/cors";

const app = express();

// ✅ Move CORS to the top before any routes
app.use(cors(corsConfig));
app.options("*", cors(corsConfig)); // Enable pre-flight requests

// Body parser
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));

// ✅ Keep only one Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    dbStatus:
      mongoose.connection.readyState === mongoose.ConnectionStates.connected
        ? "connected"
        : "disconnected",
  });
});

// Initialize database
(async () => {
  try {
    await init();
  } catch (error) {
    logger.error("Failed to initialize database:", error);
    if (process.env.NODE_ENV === "production") {
      process.exit(1);
    }
  }
})();

// Routes
app.use("/user", userRoutes);
app.use("/coin", coinRoutes);
app.use("/feedback", messageRoutes);
app.use("/cointrade", coinTradeRoutes);
app.use("/chart", chartRoutes);

// Error handling middleware
app.use(
  (err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    logger.error("Error:", err);
    res.status(500).json({
      error: "Internal Server Error",
      message: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
);

export default app;
