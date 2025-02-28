"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
require("dotenv-flow/config");
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const user_1 = __importDefault(require("./routes/user"));
const coin_1 = __importDefault(require("./routes/coin"));
const feedback_1 = __importDefault(require("./routes/feedback"));
const coinTradeRoutes_1 = __importDefault(require("./routes/coinTradeRoutes"));
const chart_1 = __importDefault(require("./routes/chart"));
const dbConncetion_1 = require("./db/dbConncetion");
const logger_1 = require("./sockets/logger");
const cors_2 = __importDefault(require("./config/cors"));
const config_1 = require("./config/config");
const priceRoutes_1 = __importDefault(require("./routes/priceRoutes"));
const app = (0, express_1.default)();
// ✅ Move CORS to the top before any routes
app.use((0, cors_1.default)(cors_2.default));
app.options("*", (0, cors_1.default)(cors_2.default)); // Enable pre-flight requests
// Body parser
app.use(body_parser_1.default.json({ limit: "50mb" }));
app.use(body_parser_1.default.urlencoded({ extended: true, limit: "50mb" }));
// ✅ Keep only one Health check endpoint
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        environment: config_1.cluster,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        dbStatus: mongoose_1.default.connection.readyState === mongoose_1.default.ConnectionStates.connected
            ? "connected"
            : "disconnected",
    });
});
// Initialize database
(async () => {
    try {
        await (0, dbConncetion_1.init)();
    }
    catch (error) {
        logger_1.logger.error("Failed to initialize database:", error);
    }
})();
// Routes
app.use("/user", user_1.default);
app.use("/coin", coin_1.default);
app.use("/feedback", feedback_1.default);
app.use("/cointrade", coinTradeRoutes_1.default);
app.use("/chart", chart_1.default);
app.use("/price", priceRoutes_1.default);
// Error handling middleware
app.use((err, req, res, next) => {
    logger_1.logger.error("Error:", err);
    res.status(500).json({
        error: "Internal Server Error",
        message: err.message,
    });
});
exports.default = app;
