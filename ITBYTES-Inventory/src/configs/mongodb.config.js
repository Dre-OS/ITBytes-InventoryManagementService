const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/itbytes_db';
        
        const connection = await mongoose.connect(uri, {
            dbName: 'itbytes_db',
            serverSelectionTimeoutMS: 5000,
            autoIndex: true,
            maxPoolSize: 10
        });

        // Add error handlers
        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('MongoDB disconnected. Attempting to reconnect...');
        });

        mongoose.connection.on('reconnected', () => {
            console.log('MongoDB reconnected');
        });

        console.log(`MongoDB Connected: ${connection.connection.host}`);
        return connection;
    } catch (error) {
        console.error(`MongoDB connection error: ${error.message}`);
        throw error; // Let the calling code handle the error
    }
};

module.exports = connectDB;