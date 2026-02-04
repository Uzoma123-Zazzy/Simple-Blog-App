const express = require('express')
const {middleware} = require('../Middleware/MiddleWare.js')  
const {createPost, deletePost, getAllPosts, getPostById} = require('../Controllers/postController.js')


const router = express.Router(); // Initialize a new router

router.post("/createpost", middleware, createPost);

router.get("/getallposts", middleware, getAllPosts);

router.get("/getpost/:id", middleware, getPostById);

router.delete("/:id",middleware ,  deletePost)

module.exports = router