const express = require("express");
const {middleware} = require('../Middleware/MiddleWare.js')  

const router = express.Router();

// Public pages
router.get("/", (req, res) => {
  res.render("home", { user: null });
});

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
