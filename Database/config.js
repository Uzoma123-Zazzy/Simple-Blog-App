
const mongoose = require('mongoose')  
const dotenv = require('dotenv') 


dotenv.config();


const mongodb_URL = process.env.MONGODB_URL;


const connectDB = async (req, res) => {
  try {
   
    const connection = await mongoose.connect(mongodb_URL);

    console.log("MongoDB connected successfully");

    
    return connection;
  } catch (error) {
    console.log(error);
   // res.status(500).json({ message: "MongoDB connection error" });
  }
};
module.exports = {connectDB}