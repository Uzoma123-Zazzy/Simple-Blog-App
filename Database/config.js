
const mongoose = require('mongoose')  
const dotenv = require('dotenv') 


dotenv.config();


const mongodb_URL = process.env.MONGODB_URL;
let connectionPromise;


const connectDB = async () => {
  try {
    if (!mongodb_URL) {
      throw new Error("MONGODB_URL is missing from the .env file");
    }

    if (mongoose.connection.readyState === 1) {
      return mongoose.connection;
    }

    if (connectionPromise) {
      return connectionPromise;
    }
   
    connectionPromise = mongoose.connect(mongodb_URL, {
      serverSelectionTimeoutMS: 5000,
    });

    const connection = await connectionPromise;

    console.log("MongoDB connected successfully");
    return connection;
  } catch (error) {
    connectionPromise = null;
    console.error(`MongoDB connection failed: ${error.message}`);
    throw error;
  }
};
module.exports = {connectDB}
