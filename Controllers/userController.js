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
    // Update the user details in the database
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          username: req.body.username, // Update username if provided
          email: req.body.email, // Update email if provided
          password: req.body.password, // Update password if provided
          profilePicture: req.body.profilePicture, // Update profile picture if provided
        },
      },
      { new: true } // Ensure the updated user document is returned
    );

    // Exclude the password field from the response
    const { password: _, ...user } = updatedUser._doc;

    // Send success response with updated user details (excluding password)
    res.status(200).json({
      message: "User updated successfully", // Success message
      result: user, // Updated user details (without password)
    });
  } catch (error) {
    // Handle any errors during the update operation
    next(error);
  }
};

// Controller to handle deleting a user profile
const deleteUser = async (req, res, next) => {
  // Check if the user is trying to delete their own account
  if (req.params.id !== req.user.id) {
    return next(errorHandler(403, "You can only delete your account!")); // Send a 403 Forbidden error if not
  }

  try {
    // Delete the user from the database by ID
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "User deleted successfully" }); // Send success response
  } catch (error) {
    // Handle any errors during the delete operation
    next(error);
  }
};

module.exports = {updateUser, deleteUser}