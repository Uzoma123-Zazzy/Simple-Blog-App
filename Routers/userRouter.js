const express = require('express') 
const {updateUser,deleteUser,getProfile,completeProfile} = require('../Controllers/userController.js')  
const {middleware} = require('../Middleware/MiddleWare.js')  
const router = express.Router(); 

router.get("/profile", middleware, getProfile);

router.put("/profile", middleware, completeProfile);

router.put("/update/:id", middleware, updateUser);


router.delete("/delete/:id", middleware, deleteUser);


module.exports = router
