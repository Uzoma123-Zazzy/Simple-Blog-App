const express = require('express')
const {middleware} = require('../Middleware/MiddleWare.js')  
const {createPost, deletePost, getAllPosts, getPostById} = require('../Controllers/postController.js')


const router = express.Router(); 

router.post("/createpost", middleware, createPost);

router.get("/getallposts", getAllPosts);

router.get("/getpost/:id", getPostById);

router.delete("/delete/:id",middleware ,  deletePost)

module.exports = router
