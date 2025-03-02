import { Server, Socket } from 'socket.io';
import { logger } from './logger';
import corsConfig from '../config/cors';

const socketio = (server: any): Server => {
  try {
    const io = new Server(server, {
      cors: {
        origin: corsConfig.origin,
        methods: corsConfig.methods,
        credentials: corsConfig.credentials
      },
      transports: ['websocket', 'polling'],
      pingTimeout: 60000,
      pingInterval: 25000
    });
    
    io.on('connection', (socket: Socket) => {
      const id = (socket as any).user?.user?.id;
      // logger.info(`New socket connection (${socket.id}) -> ${id}`);
      
      socket.on('disconnect', (reason) => {
        // logger.info(`Socket disconnected (${socket.id}): ${reason}`);
      });

      socket.on('error', (error) => {
        logger.error(`Socket error (${socket.id}):`, error);
      });
    });

    // logger.info('Socket.IO server initialized successfully');
    return io;
  } catch (error) {
    logger.error('Socket.IO initialization failed:', error);
    throw error;
  }
};

export default socketio;