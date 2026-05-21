const User = require('../Models/userModel.js')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
const validator = require('validator')
const { errorHandler } = require('../Utils/Error.js')

dotenv.config()

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, isAdmin: user.isAdmin, username: user.username },
    process.env.JWT_SECRET_KEY,
    { expiresIn: '1d' }
  )
}

// SIGN UP
const registerUser = async (req, res, next) => {
  const { username, email, password } = req.body

  try {
    if (!username || !email || !password) {
      return next(errorHandler(400, "All fields are required"))
    }

    if (!validator.isEmail(email)) {
      return next(errorHandler(400, "Invalid email format"))
    }

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return next(errorHandler(409, "User already exists"))
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = new User({
      username,
      email,
      password: hashedPassword
    })

    await newUser.save()

    const token = generateToken(newUser)

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000
    })

    const { password: _, ...user } = newUser._doc

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      result: user
    })

  } catch (err) {
    next(err)
  }
}


// SIGN IN 
const signinUser = async (req, res, next) => {
  const { email, password } = req.body

  try {
    if (!email || !password) {
      return next(errorHandler(400, "All fields are required"))
    }

    const user = await User.findOne({ email }).select("+password")

    if (!user) {
      return next(errorHandler(404, "User not found"))
    }

    const isValid = await bcrypt.compare(password, user.password)

    if (!isValid) {
      return next(errorHandler(401, "Invalid credentials"))
    }

    const token = generateToken(user)

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000
    })

    const { password: _, ...userData } = user._doc

    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      result: userData
    })

  } catch (err) {
    next(err)
  }
}


// GOOGLE AUTH 
const googleAuth = async (req, res, next) => {
  const { email, name, picture } = req.body

  try {
    let userDetail = await User.findOne({ email })

    if (!userDetail) {

      const generatedPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8)

      const hashedPassword = await bcrypt.hash(generatedPassword, 10)

      userDetail = new User({
        username:
          name.toLowerCase().split(" ").join("") +
          Math.random().toString(9).slice(-4),
        email,
        password: hashedPassword,
        profilePicture: picture
      })

      await userDetail.save()
    }

    const token = generateToken(userDetail)

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000
    })

    const { password: _, ...user } = userDetail._doc

    res.status(200).json({
      success: true,
      message: "User authenticated successfully",
      result: user
    })

  } catch (error) {
    next(error)
  }
}

module.exports = { googleAuth, registerUser, signinUser }