const express = require('express')
const {googleAuth,registerUser,
  signinUser,} = require('../Controllers/authController.js') 
const {middleware} = require('../Middleware/MiddleWare.js')

const router = express.Router(); 

router.get("/me", middleware, (req, res) => {
  res.status(200).json({
    success: true,
    message: "User authenticated",
    result: req.user,
  });
});


router.post("/register-user", registerUser);


router.post("/signin-user", signinUser);


router.post("/googleauth", googleAuth);


module.exports = router
