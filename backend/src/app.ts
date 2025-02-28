import express from "express";
import "dotenv-flow/config";
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
import { cluster } from "./config/config";
import priceRoutes from "./routes/priceRoutes"

const app = express();

app.use(cors(corsConfig));
app.options("*", cors(corsConfig)); // Enable pre-flight requests

// Body parser
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    environment: cluster,
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
  }
})();

// Routes
app.use("/user", userRoutes);
app.use("/coin", coinRoutes);
app.use("/feedback", messageRoutes);
app.use("/cointrade", coinTradeRoutes);
app.use("/chart", chartRoutes);
app.use("/price", priceRoutes)

// Error handling middleware
app.use(
  (err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    logger.error("Error:", err);
    res.status(500).json({
      error: "Internal Server Error",
      message: err.message,
    });
  }
);

export default app;
