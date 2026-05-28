const User = require('../Models/userModel.js')
const { errorHandler } = require('../Utils/Error.js')
const bcrypt = require('bcrypt')

const DEFAULT_AVATAR = "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541"

const getUserData = (userDocument) => {
  const { password: _, ...user } = userDocument._doc
  return user
}


// UPDATE USER 
const updateUser = async (req, res, next) => {
  try {

    if (req.params.id !== req.user.id) {
      return next(errorHandler(403, "You can only update your own account"))
    }

    // Password validation
    if (req.body.password) {

      if (req.body.password.length < 6) {
        return next(errorHandler(400, "Password must be at least 6 characters long"))
      }

      req.body.password = bcrypt.hashSync(req.body.password, 10)
    }

    // Username validation
    if (req.body.username) {

      if (req.body.username.length < 3 || req.body.username.length > 20) {
        return next(errorHandler(400, "Username must be between 3 and 20 characters"))
      }

      if (req.body.username.includes(" ")) {
        return next(errorHandler(400, "Username must not contain spaces"))
      }

      if (req.body.username !== req.body.username.toLowerCase()) {
        return next(errorHandler(400, "Username must be lowercase"))
      }

      if (!req.body.username.match(/^[A-Za-z0-9]+$/)) {
        return next(errorHandler(400, "Username must not contain special characters"))
      }
    }

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
    )

    if (!updatedUser) {
      return next(errorHandler(404, "User not found"))
    }

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      result: getUserData(updatedUser),
    })

  } catch (error) {
    next(error)
  }
}

// GET CURRENT USER PROFILE
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)

    if (!user) {
      return next(errorHandler(404, "User not found"))
    }

    res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      result: getUserData(user),
    })

  } catch (error) {
    next(error)
  }
}


// COMPLETE OR UPDATE PROFILE
const completeProfile = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      bio,
      avatar,
      profilePicture,
      personalWebsite,
      socialLinks,
      country,
    } = req.body

    if (!firstName || !lastName || !bio) {
      return next(errorHandler(400, "First name, last name, and bio are required"))
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: {
          firstName,
          lastName,
          bio,
          profilePicture: avatar || profilePicture || DEFAULT_AVATAR,
          personalWebsite,
          socialLinks: {
            twitter: socialLinks?.twitter || "",
            facebook: socialLinks?.facebook || "",
            instagram: socialLinks?.instagram || "",
            linkedin: socialLinks?.linkedin || "",
          },
          country,
          profileCompleted: true,
        },
      },
      { new: true, runValidators: true }
    )

    if (!updatedUser) {
      return next(errorHandler(404, "User not found"))
    }

    res.status(200).json({
      success: true,
      message: "Profile completed successfully",
      result: getUserData(updatedUser),
    })

  } catch (error) {
    next(error)
  }
}


// DELETE USER
const deleteUser = async (req, res, next) => {
  try {

    if (req.params.id !== req.user.id) {
      return next(errorHandler(403, "You can only delete your own account"))
    }

    const user = await User.findById(req.params.id)

    if (!user) {
      return next(errorHandler(404, "User not found"))
    }

    await User.findByIdAndDelete(req.params.id)

    res.status(200).json({
      success: true,
      message: "User deleted successfully"
    })

  } catch (error) {
    next(error)
  }
}

module.exports = { updateUser, deleteUser, getProfile, completeProfile }
