const jwt = require('jsonwebtoken') 
const {errorHandler} = require('../Utils/Error.js') 
const dotenv = require('dotenv')  

dotenv.config(); 


const middleware = (req, res, next) => {
 
  const authHeader = req.headers.authorization;
  const token =
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : req.headers.token; 

  if (!token) {
    return next(errorHandler(401, "Unauthorized user - token missing"));
  }

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
    if (err) {
      return next(errorHandler(403, "Invalid or expired token"));
    }

    req.user = { id: user.id || user._id, isAdmin: user.isAdmin };
    next();
  });
};

module.exports = {middleware}