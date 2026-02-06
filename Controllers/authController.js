const User = require('../Models/userModel.js') 
const {errorHandler} = require('../Utils/Error.js') 
const bcrypt = require('bcrypt') 
const jwt = require('jsonwebtoken') 
const dotenv = require('dotenv') 
const validator = require('validator') 

dotenv.config(); 

// Register new user
const registerUser = async (req, res, next) => {
  const { username, email, password } = req.body;
  // Validate that all fields are provided and email is valid
  if (
    !username ||
    !email ||
    !password ||
    username === "" ||
    email === "" ||
    password === ""
  ) {
    return next(errorHandler(400, "All fields are required"));
  }

  if (!validator.isEmail(email)) {
    return next(errorHandler(400, "Invalid email format")); // Validate email format
  }

  try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
          return next(errorHandler(409, "User already exists with this email"));
        }
      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new User({ username, email, password: hashedPassword });
      await newUser.save();
      res
      .status(201)
      .json({ message: "User registered successfully", result: newUser });
  
  }
  catch(error){
        next(error);      
  }
};

// User sign-in function
const signinUser = async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email and password
  if (!email || !password || email === "" || password === "") {
    return next(errorHandler(400, "All fields are required"));
  }

  try {
    const userDetail = await User.findOne({ email }).select("+password"); 
    if (!userDetail) {
      return next(errorHandler(404, "User not found")); 
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      userDetail.password
    ); // Compare provided password with the stored hash
    if (!isPasswordValid) {
      return next(errorHandler(401, "Invalid credentials")); 
    }

   
    const token = jwt.sign(
      { id: userDetail._id, isAdmin: userDetail.isAdmin },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1d" }
    );

   
    const { password: _, ...user } = userDetail._doc;
    res.status(200).json({
      message: "User logged in successfully",
      result: user,
      token,
    });
  } catch (error) {
    next(error); 
  }
};

// Google Authentication
const googleAuth = async (req, res, next) => {
  const { email, name, picture } = req.body;

  try {
  
    const userDetail = await User.findOne({ email });
    if (userDetail) {
      
      const token = jwt.sign(
        { id: userDetail._id, isAdmin: userDetail.isAdmin },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "1d" }
      );
      const { password: _, ...user } = userDetail._doc;
      res.status(200).json({
        message: "User logged in successfully",
        result: user,
        token,
      });
    } else {
     
      const generatedPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8); 
      const hashedPassword = await bcryptjs.hash(generatedPassword, 10); 

      const newUser = new User({
        username:
          name.toLowerCase().split(" ").join("") +
          Math.random().toString(9).slice(-4), 
        email,
        password: hashedPassword,
        profilePicture: picture,
      });

      await newUser.save(); 

      const token = jwt.sign(
        { id: newUser._id, isAdmin: newUser.isAdmin },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "1d" }
      );

      
      const { password: _, ...user } = newUser._doc;
      res.status(201).json({
        message: "User registered successfully",
        result: user,
        token,
      });
    }
  } catch (error) {
    next(error); 
  }
};

module.exports = {googleAuth,registerUser,signinUser,}
  