const express = require('express') 
const {updateUser,deleteUser} = require('../Controllers/userController.js')  
const {middleware} = require('../Middleware/MiddleWare.js')  
const router = express.Router(); // Creating a new router instance

router.put("/update/:id", middleware, updateUser);


router.delete("/delete/:id", middleware, deleteUser);


module.exports = router