import { createServer } from 'http';
import app from './app';
import socketio from './sockets';
import { logger } from './sockets/logger';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import { cluster, RPC_ENDPOINT } from './config/config';
import { checkAnonymousUser } from './routes/user';

console.log("Loaded ENV File:", `.env.${process.env.NODE_ENV || "development"}`);
console.log("RPC ENDPOINT:", RPC_ENDPOINT);
console.log('MODE', process.env.MODE)

const PORT = process.env.PORT || 3001;

const server = createServer(app);
let io: Server | null = null;

// Graceful shutdown handler
async function gracefulShutdown(signal: string) {
  // logger.info(`Received ${signal}. Starting graceful shutdown...`);

  // Set a timeout for the entire shutdown process
  const shutdownTimeout = setTimeout(() => {
    logger.error('Shutdown timed out, forcing exit');
    process.exit(1);
  }, 10000);

  try {
    // Close Socket.IO connections
    if (io) {
      // logger.info('Closing Socket.IO connections...');
      await new Promise<void>((resolve) => {
        io?.close(() => {
          // logger.info('Socket.IO server closed');
          resolve();
        });
      });
    }

    // Close HTTP server
    await new Promise<void>((resolve) => {
      server.close(() => {
        // logger.info('HTTP server closed');
        resolve();
      });
    });

    // Close MongoDB connection
    if (mongoose.connection.readyState === 1) {
      // logger.info('Closing MongoDB connection...');
      await mongoose.connection.close();
      // logger.info('MongoDB connection closed');
    }

    clearTimeout(shutdownTimeout);
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown:', error);
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
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

checkAnonymousUser()

// Initialize Socket.IO
try {
  io = socketio(server);
} catch (error) {
  logger.error('Socket.io initialization error:', error);
}

// Start server
server.listen(PORT, () => {
  logger.info(`Server running in ${cluster} mode on port ${PORT}`);
});

export default server;
