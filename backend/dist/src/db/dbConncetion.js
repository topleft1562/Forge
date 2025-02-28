"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = require("../sockets/logger");
const init = async () => {
    try {
        const DB_CONNECTION = process.env.MONGODB_URI;
        if (!DB_CONNECTION) {
            throw new Error('MongoDB URI is not defined in environment variables');
        }
        // If already connected, return early
        if (mongoose_1.default.connection.readyState === mongoose_1.default.ConnectionStates.connected) {
            logger_1.logger.info('MongoDB already connected');
            return;
        }
        await mongoose_1.default.connect(DB_CONNECTION);
        logger_1.logger.info('MongoDB database connected successfully');
    }
    catch (error) {
        logger_1.logger.error('MongoDB connection error:', error);
        throw error; // Re-throw to handle in app.ts
    }
};
exports.init = init;
