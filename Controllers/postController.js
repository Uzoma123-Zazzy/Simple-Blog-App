const Post = require("../Models/postModel.js")
const User = require("../Models/userModel.js")
const { errorHandler } = require("../Utils/Error.js")

//  CREATE POST 
const createPost = async (req, res, next) => {
  try {

    if (!req.body.title || !req.body.content || !req.body.category) {
      return next(errorHandler(400, "Title, content, and category are required"))
    }

    const { title, content, image, category } = req.body

 const newPost = new Post({
  title,
  content,
  image,
  category,
  userId: req.user.id
})

    const savedPost = await newPost.save()

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      result: savedPost,
    })

  } catch (error) {
    next(error)
  }
}


// GET ALL POSTS 
const getAllPosts = async (req, res, next) => {
  try {

    const search = req.query.search || ""

    let posts

    if (search) {
      posts = await Post.find({
        $or: [
          { title: { $regex: search, $options: "i" } },
          { content: { $regex: search, $options: "i" } },
          { category: { $regex: search, $options: "i" } },
        ],
      }).sort({ updatedAt: -1, createdAt: -1 })
    } else {
      posts = await Post.find().sort({ updatedAt: -1, createdAt: -1 })
    }

    res.status(200).json({
      success: true,
      message: "Posts fetched successfully",
      result: posts,
    })

  } catch (error) {
    next(error)
  }
}


// GET POST BY ID
const getPostById = async (req, res, next) => {
  try {

    const post = await Post.findById(req.params.id)

    if (!post) {
      return next(errorHandler(404, "Post not found"))
    }

    res.status(200).json({
      success: true,
      message: "Post fetched successfully",
      result: post,
    })

  } catch (error) {
    next(error)
  }
}

// UPDATE POST
const updatePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)

    if (!post) {
      return next(errorHandler(404, "Post not found"))
    }

    if (!post.userId || post.userId.toString() !== req.user.id) {
      return next(errorHandler(403, "You can only update your own post"))
    }

    const allowedFields = ["title", "content", "image", "category"]
    const updateFields = {}

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateFields[field] = req.body[field]
      }
    })

    if (Object.keys(updateFields).length === 0) {
      return next(errorHandler(400, "No post fields provided for update"))
    }

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    )

    res.status(200).json({
      success: true,
      message: "Post updated successfully",
      result: updatedPost,
    })

  } catch (error) {
    next(error)
  }
}


// DELETE POST 
const deletePost = async (req, res, next) => {
  try {

    const post = await Post.findById(req.params.id)

    if (!post) {
      return next(errorHandler(404, "Post not found"))
    }

    const user = await User.findById(req.user.id)

    // Only admins can delete posts
    if (!user?.isAdmin) {
      return next(errorHandler(403, "Only admins can delete posts"))
    }

    await post.deleteOne()

    res.status(200).json({
      success: true,
      message: "Post deleted successfully",
    })

  } catch (error) {
    next(error)
  }
}

module.exports = {
  createPost,
  deletePost,
  getAllPosts,
  getPostById,
  updatePost,
}
