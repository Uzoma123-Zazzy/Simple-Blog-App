const User = require('../Models/userModel.js') 
const {errorHandler} = require('../Utils/Error.js') 
const bcrypt = require('bcrypt')

const updateUser = async (req, res, next) => {
  

  if (req.params.id !== req.user.id) {
    return next(errorHandler(403, "You can only update your account!")); 
  }

  
  if (req.body.password) {
    
    if (req.body.password.length < 6) {
      return next(
        errorHandler(400, "Password must be at least 6 characters long") 
      );
    }

    req.body.password = bcrypt.hashSync(req.body.password, 10);

    if (req.body.username) {
      
      if (req.body.username.length < 3 || req.body.username.length > 20) {
        return next(
          errorHandler(400, "Username must be at least 3 characters long") 
        );
      }
      
      if (req.body.username.includes(" ")) {
        return next(errorHandler(400, "Username must not contain spaces")); 
      }
      
      if (req.body.username !== req.body.username.toLowerCase()) {
        return next(errorHandler(400, "Username must be in lowercase")); 
      }
      // Ensure username contains only alphanumeric characters
      if (!req.body.username.match(/^[A-Za-z0-9]+$/)) {
        return next(
          errorHandler(400, "Username must not contain special characters") 
        );
      }
    }
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          username: req.body.username, 
          email: req.body.email, 
          password: req.body.password, 
          profilePicture: req.body.profilePicture, 
        },
      },
      { new: true } 
    );

    const { password: _, ...user } = updatedUser._doc;

    res.status(200).json({
      message: "User updated successfully", 
      result: user, 
    });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  if (req.params.id !== req.user.id) {
    return next(errorHandler(403, "You can only delete your account!")); 
  }

  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "User deleted successfully" }); 
  } catch (error) {
    next(error);
  }
};

module.exports = {updateUser, deleteUser}