const express = require("express");
const Post = require("../Models/postModel.js") 
const {middleware} = require('../Middleware/MiddleWare.js')  

const router = express.Router();

// Public pages
router.get("/", (req, res) => {
  res.render("home", { user: null });
});

router.get('/posts', middleware, async (req, res, next) => {
  try {
    // Fetch all posts from database
    const posts = await Post.find({}).sort({ createdAt: -1 }) // newest first

    // Pass posts and current user to EJS
    res.render('Posts', {
      posts,
      user: req.user
    })
  } catch (error) {
    next(error)
  }
})

router.get("/signin", (req, res) => {
  res.render("signin");
});

router.get("/signup", (req, res) => {
  res.render("signup");
});

// Protected pages
router.get("/create-post", middleware, (req, res) => {
  res.render("create-post", { user: req.user });
});

router.get("/profile", middleware, (req, res) => {
  res.render("profile", { user: req.user });
});

module.exports = router;
