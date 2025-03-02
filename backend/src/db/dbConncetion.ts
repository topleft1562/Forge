import mongoose from "mongoose";
import { logger } from '../sockets/logger';

export const init = async (): Promise<void> => {
  try {
    const DB_CONNECTION = process.env.MONGODB_URI;
    
    if (!DB_CONNECTION) {
      throw new Error('MongoDB URI is not defined in environment variables');
    }

    // If already connected, return early
    if (mongoose.connection.readyState === mongoose.ConnectionStates.connected) {
      // logger.info('MongoDB already connected');
      return;
    }

    await mongoose.connect(DB_CONNECTION);
    // logger.info('MongoDB database connected successfully');

  } catch (error) {
    logger.error('MongoDB connection error:', error);
    throw error; // Re-throw to handle in app.ts
  }
};