const jwt = require('jsonwebtoken')
const { errorHandler } = require('../Utils/Error.js')
const dotenv = require('dotenv')

dotenv.config()

const middleware = (req, res, next) => {
  // Get token from cookies
  const token = req.cookies?.token

  if (!token) {
    return next(errorHandler(401, "Unauthorized user - token missing"))
  }

  // Verify token
  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
    if (err) {
      return next(errorHandler(403, "Invalid or expired token"))
    }

    // Add user info to req.user
    req.user = { id: user.id, isAdmin: user.isAdmin, username: user.username }
    next()
  })
}

module.exports = { middleware }
