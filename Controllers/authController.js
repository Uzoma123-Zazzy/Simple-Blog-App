const User = require('../Models/userModel.js')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
const validator = require('validator')
const { errorHandler } = require('../Utils/Error.js')

dotenv.config()

const ACCESS_TOKEN_MAX_AGE = 15 * 60 * 1000
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
}

const getUserData = (userDocument) => {
  const { password: _, ...user } = userDocument._doc
  return user
}

const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, isAdmin: user.isAdmin, username: user.username },
    process.env.JWT_SECRET_KEY,
    { expiresIn: '15m' }
  )
}

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET_KEY,
    { expiresIn: '7d' }
  )
}

const setAuthCookies = (res, user) => {
  res.cookie("accessToken", generateAccessToken(user), {
    ...cookieOptions,
    maxAge: ACCESS_TOKEN_MAX_AGE,
  })

  res.cookie("refreshToken", generateRefreshToken(user), {
    ...cookieOptions,
    maxAge: REFRESH_TOKEN_MAX_AGE,
  })

  res.clearCookie("token", cookieOptions)
}

const clearAuthCookies = (res) => {
  res.clearCookie("accessToken", cookieOptions)
  res.clearCookie("refreshToken", cookieOptions)
  res.clearCookie("token", cookieOptions)
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

    setAuthCookies(res, newUser)

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      result: getUserData(newUser)
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

    setAuthCookies(res, user)

    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      result: getUserData(user)
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

    setAuthCookies(res, userDetail)

    res.status(200).json({
      success: true,
      message: "User authenticated successfully",
      result: getUserData(userDetail)
    })

  } catch (error) {
    next(error)
  }
}

const refreshAccessToken = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken

    if (!token) {
      return next(errorHandler(401, "Refresh token missing"))
    }

    const payload = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET_KEY)
    const user = await User.findById(payload.id)

    if (!user) {
      clearAuthCookies(res)
      return next(errorHandler(404, "User not found"))
    }

    res.cookie("accessToken", generateAccessToken(user), {
      ...cookieOptions,
      maxAge: ACCESS_TOKEN_MAX_AGE,
    })

    res.status(200).json({
      success: true,
      message: "Access token refreshed",
      result: getUserData(user),
    })

  } catch (error) {
    clearAuthCookies(res)
    next(errorHandler(403, "Invalid or expired refresh token"))
  }
}

const logoutUser = (req, res) => {
  clearAuthCookies(res)
  res.status(200).json({
    success: true,
    message: "User logged out successfully",
  })
}

module.exports = { googleAuth, registerUser, signinUser, refreshAccessToken, logoutUser }
