const jwt = require('jsonwebtoken')
const { errorHandler } = require('../Utils/Error.js')
const dotenv = require('dotenv')
const User = require('../Models/userModel.js')

dotenv.config()

const ACCESS_TOKEN_MAX_AGE = 15 * 60 * 1000

const setAccessCookie = (res, user) => {
  const accessToken = jwt.sign(
    { id: user._id, isAdmin: user.isAdmin, username: user.username },
    process.env.JWT_SECRET_KEY,
    { expiresIn: '15m' }
  )

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: ACCESS_TOKEN_MAX_AGE,
  })
}

const refreshAccessFromCookie = async (req, res, next) => {
  const refreshToken = req.cookies?.refreshToken

  if (!refreshToken) {
    return next(errorHandler(401, "Unauthorized user - token missing"))
  }

  try {
    const refreshPayload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET_KEY)
    const userDetail = await User.findById(refreshPayload.id)

    if (!userDetail) {
      return next(errorHandler(404, "User not found"))
    }

    setAccessCookie(res, userDetail)
    req.user = { id: userDetail._id.toString(), isAdmin: userDetail.isAdmin, username: userDetail.username }
    return next()
  } catch (error) {
    return next(errorHandler(403, "Invalid or expired refresh token"))
  }
}

const middleware = async (req, res, next) => {
  const token = req.cookies?.accessToken || req.cookies?.token

  if (!token) {
    return refreshAccessFromCookie(req, res, next)
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET_KEY)
    req.user = { id: user.id, isAdmin: user.isAdmin, username: user.username }
    next()
  } catch (error) {
    return refreshAccessFromCookie(req, res, next)
  }
}

module.exports = { middleware }
