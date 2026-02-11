const User = require('../Models/userModel.js')
const { errorHandler } = require('../Utils/Error.js')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
const validator = require('validator')

dotenv.config()

// Helper to generate JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, isAdmin: user.isAdmin, username: user.username },
    process.env.JWT_SECRET_KEY,
    { expiresIn: '1d' }
  )
}

// ------------------ REGISTER USER ------------------
const registerUser = async (req, res, next) => {
  const { username, email, password } = req.body

  if (!username || !email || !password) {
    return next(errorHandler(400, "All fields are required"))
  }

  if (!validator.isEmail(email)) {
    return next(errorHandler(400, "Invalid email format"))
  }

  try {
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return next(errorHandler(409, "User already exists with this email"))
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = new User({ username, email, password: hashedPassword })
    await newUser.save()

    const token = generateToken(newUser)

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000
    })

    // Redirect to home feed after registration
    res.redirect('/Posts')
  } catch (error) {
    next(error)
  }
}

// ------------------ SIGN IN USER ------------------
const signinUser = async (req, res, next) => {
  const { email, password } = req.body

  if (!email || !password) {
    return next(errorHandler(400, "All fields are required"))
  }

  try {
    const userDetail = await User.findOne({ email }).select("+password")
    if (!userDetail) {
      return next(errorHandler(404, "User not found"))
    }

    const isPasswordValid = await bcrypt.compare(password, userDetail.password)
    if (!isPasswordValid) {
      return next(errorHandler(401, "Invalid credentials"))
    }

    const token = generateToken(userDetail)

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000
    })

    // Redirect to home feed after successful login
    res.redirect('/Posts')
  } catch (error) {
    next(error)
  }
}

// ------------------ GOOGLE AUTH ------------------
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

    // Redirect to home feed
    res.redirect('/Posts')
  } catch (error) {
    next(error)
  }
}

module.exports = { googleAuth, registerUser, signinUser }
