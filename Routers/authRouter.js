const express = require('express')
const {googleAuth,registerUser,
  signinUser,} = require('../Controllers/authController.js') 

const router = express.Router(); 


router.post("/register-user", registerUser);


router.post("/signin-user", signinUser);


router.post("/googleauth", googleAuth);


module.exports = router