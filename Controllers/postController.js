const Post = require("../Models/postModel.js") 
const {errorHandler} = require('../Utils/Error.js')

const createPost = async (req, res, next) => {
  
  if (!req.body.title || !req.body.content) {
    return next(errorHandler(400, "All fields are required"));
  }

  const { title, content, image, category } = req.body;

  const newPost = new Post({
    title,
    content,
    image,
    category,
  });

  try {
    
    const savedPost = await newPost.save();

    res.status(200).json({
      message: "Post created successfully",
      result: savedPost,
    });
  } catch (error) {
    next(error);
  }
};

const getAllPosts = async (req, res, next) => {
  try {
    const search = req.query.search || ""; 

    let posts;
    if (search) {
      posts = await Post.find({
        $or: [
          { title: { $regex: search, $options: "i" } }, 
          { content: { $regex: search, $options: "i" } }, 
          { category: { $regex: search, $options: "i" } }, 
        ],
      }).sort({ createdAt: -1 }); 
    } else {
      posts = await Post.find().sort({ createdAt: -1 });
    }

    res.status(200).json({
      message: "Posts fetched successfully",
      result: posts,
    });
  } catch (error) {
    next(error);
  }
};

const getPostById = async (req, res, next) => {
  
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return next(errorHandler(404, "Post not found"));
    }

    res.status(200).json({
      message: "Post fetched successfully",
      result: post,
    });
  } catch (error) {
    next(error);
  }
};

const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post)
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });

    if (!req.user.isAdmin) {
      return next(errorHandler(403, "Only admins can delete posts"));
    }

    await post.deleteOne();
    res
      .status(200)
      .json({ success: true, message: "Post deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {createPost, deletePost, getAllPosts, getPostById}