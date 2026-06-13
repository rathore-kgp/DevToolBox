require('dotenv').config();
const createApp = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    await connectDB();

    const app = createApp();

    const server = app.listen(PORT, () => {
        console.log('Server running in ${process.env.NODE_ENV} mode on port ${PORT}')
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