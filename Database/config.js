
const mongoose = require('mongoose')  
const dotenv = require('dotenv') 


dotenv.config();


const mongodb_URL = process.env.MONGODB_URL;


const connectDB = async (req, res) => {
  try {
    if (!mongodb_URL) {
      throw new Error("MONGODB_URL is missing from the .env file");
    }
   
    const connection = await mongoose.connect(mongodb_URL, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log("MongoDB connected successfully");

    
    return connection;
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    throw error;
  }
};
module.exports = {connectDB}
