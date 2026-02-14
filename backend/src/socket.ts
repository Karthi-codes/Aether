import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

let io: SocketIOServer;

export const initializeSocket = (httpServer: HTTPServer): SocketIOServer => {
    io = new SocketIOServer(httpServer, {
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:5173',
            methods: ['GET', 'POST'],
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);

        // Join user-specific room
        socket.on('join_user_room', (userId: string) => {
            socket.join(`user_${userId}`);
            console.log(`User ${userId} joined their room`);
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });

    return io;
};

export const getIO = (): SocketIOServer => {
    if (!io) {
        throw new Error('Socket.io not initialized. Call initializeSocket first.');
    }
    return io;
};
