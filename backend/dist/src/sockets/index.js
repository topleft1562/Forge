"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = require("socket.io");
const logger_1 = require("./logger");
const cors_1 = __importDefault(require("../config/cors"));
const socketio = (server) => {
    try {
        const io = new socket_io_1.Server(server, {
            cors: {
                origin: cors_1.default.origin,
                methods: cors_1.default.methods,
                credentials: cors_1.default.credentials
            },
            transports: ['websocket', 'polling'],
            pingTimeout: 60000,
            pingInterval: 25000
        });
        io.on('connection', (socket) => {
            const id = socket.user?.user?.id;
            logger_1.logger.info(`New socket connection (${socket.id}) -> ${id}`);
            socket.on('disconnect', (reason) => {
                logger_1.logger.info(`Socket disconnected (${socket.id}): ${reason}`);
            });
            socket.on('error', (error) => {
                logger_1.logger.error(`Socket error (${socket.id}):`, error);
            });
        });
        logger_1.logger.info('Socket.IO server initialized successfully');
        return io;
    }
    catch (error) {
        logger_1.logger.error('Socket.IO initialization failed:', error);
        throw error;
    }
};
exports.default = socketio;
