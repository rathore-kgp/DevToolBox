const mongoose = require('mongoose');

const connectDB = async () => {
    // Listen to Mongoose connection events before connecting 
    mongoose.connection.on('connected', () => {
        console.log(`MongoDB Connected: ${mongoose.connection.host}`);
    });

    mongoose.connection.on('error', (err) => {
        console.error(`MongoDB Connection Error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
        console.warn('MongoDB Disconnected. Attempting reconnect...');
    });

    try{
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS : 5000, //fail fast if DB unreachable
            socketTimeoutMS : 45000,   //closing sockets after 45s inactivity
        });
    }
    catch(error){
        console.error(`Fatal: Could not connect to MongoDB: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;