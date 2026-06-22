require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const createApp = require('./src/app');
const connectDB = require('./src/config/db');
const { initializeSocketServer } = require('./src/socket/socketServer');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    await connectDB();
    const app = createApp();

    // Create HTTP server wrapping Express app
    const httpServer = http.createServer(app);

    const io = new Server(httpServer, {
        cors: {
        origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true,
        },
        pingTimeout: 60000,    // 60s before marking client disconnected
        pingInterval: 25000,   // Ping every 25s
    });

    initializeSocketServer(io);

    httpServer.listen(PORT, () => {
        console.log(`Server + WebSocket running on port ${PORT}`);
    });

    //Graceful shutdown
    process.on('SIGTERM', () => {
        console.log('SIGTERM received. Shutting down gracefully....');
        server.close(() => {
            mongoose.connection.close(false, () => {
                console.log('MongoDB connection closed.');
                process.exit(0);
            });
        });
    });
};

startServer();