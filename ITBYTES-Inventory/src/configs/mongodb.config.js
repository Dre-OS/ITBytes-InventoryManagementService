const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb+srv://hedkkananayo:SNlqyQsqWsHuZXoe@itbytes-inventory.yigx9nb.mongodb.net/?retryWrites=true&w=majority&appName=ITBYTES-Inventory';
        
        const connection = await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            dbName: 'itbytes_db',
            serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
            autoIndex: true, // Build indexes
            maxPoolSize: 10, // Maintain up to 10 socket connections
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