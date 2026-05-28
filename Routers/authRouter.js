const express = require('express')
const {googleAuth,registerUser,
  signinUser,} = require('../Controllers/authController.js') 
const {middleware} = require('../Middleware/MiddleWare.js')
const User = require('../Models/userModel.js')

const router = express.Router(); 

router.get("/me", middleware, async (req, res, next) => {
  try {
    const userDetail = await User.findById(req.user.id)

    if (!userDetail) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    const { password: _, ...user } = userDetail._doc

    res.status(200).json({
      success: true,
      message: "User authenticated",
      result: user,
    });
  } catch (error) {
    next(error)
  }
});


router.post("/register-user", registerUser);


router.post("/signin-user", signinUser);


router.post("/googleauth", googleAuth);


module.exports = router
