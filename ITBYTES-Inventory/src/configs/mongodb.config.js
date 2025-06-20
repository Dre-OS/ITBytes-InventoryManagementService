const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const connection = await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://hedkkananayo:SNlqyQsqWsHuZXoe@itbytes-inventory.ffmfmuf.mongodb.net/?retryWrites=true&w=majority&appName=ITBYTES-Inventory', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log(`MongoDB Connected: ${connection.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;