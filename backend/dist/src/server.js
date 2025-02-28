"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const app_1 = __importDefault(require("./app"));
const sockets_1 = __importDefault(require("./sockets"));
const logger_1 = require("./sockets/logger");
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = require("./config/config");
const user_1 = require("./routes/user");
console.log("Loaded ENV File:", `.env.${process.env.NODE_ENV || "development"}`);
console.log("RPC ENDPOINT:", process.env.RPC_ENDPOINT);
console.log('MODE', process.env.MODE);
const PORT = process.env.PORT || 3001;
const server = (0, http_1.createServer)(app_1.default);
let io = null;
// Graceful shutdown handler
async function gracefulShutdown(signal) {
    logger_1.logger.info(`Received ${signal}. Starting graceful shutdown...`);
    // Set a timeout for the entire shutdown process
    const shutdownTimeout = setTimeout(() => {
        logger_1.logger.error('Shutdown timed out, forcing exit');
        process.exit(1);
    }, 10000);
    try {
        // Close Socket.IO connections
        if (io) {
            logger_1.logger.info('Closing Socket.IO connections...');
            await new Promise((resolve) => {
                io?.close(() => {
                    logger_1.logger.info('Socket.IO server closed');
                    resolve();
                });
            });
        }
        // Close HTTP server
        await new Promise((resolve) => {
            server.close(() => {
                logger_1.logger.info('HTTP server closed');
                resolve();
            });
        });
        // Close MongoDB connection
        if (mongoose_1.default.connection.readyState === 1) {
            logger_1.logger.info('Closing MongoDB connection...');
            await mongoose_1.default.connection.close();
            logger_1.logger.info('MongoDB connection closed');
        }
        clearTimeout(shutdownTimeout);
        process.exit(0);
    }
    catch (error) {
        logger_1.logger.error('Error during shutdown:', error);
        clearTimeout(shutdownTimeout);
        process.exit(1);
    }
}
// Handle shutdown signals
['SIGTERM', 'SIGINT'].forEach((signal) => {
    process.on(signal, () => gracefulShutdown(signal));
});
// Handle uncaught errors
process.on('unhandledRejection', (reason, promise) => {
    logger_1.logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (error) => {
    logger_1.logger.error('Uncaught Exception:', error);
    gracefulShutdown('UNCAUGHT_EXCEPTION');
});
(0, user_1.checkAnonymousUser)();
// Initialize Socket.IO
try {
    io = (0, sockets_1.default)(server);
}
catch (error) {
    logger_1.logger.error('Socket.io initialization error:', error);
}
// Start server
server.listen(PORT, () => {
    logger_1.logger.info(`Server running in ${config_1.cluster} mode on port ${PORT}`);
});
exports.default = server;
