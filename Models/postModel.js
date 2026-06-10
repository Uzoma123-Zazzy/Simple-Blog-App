
const mongoose = require('mongoose')  

const DEFAULT_POST_IMAGE = "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=900&q=80"

const postSchema = new mongoose.Schema(
  {
    // Blog content field
    content: {
      type: String,
      required: [true, "Content is required"],        
      trim: true,                                       
      minlength: [1, "Content must be at least 1 character long"],
      maxlength: [10000, "Content cannot exceed 10000 characters"],
      index: true,                                      
    },

    // Blog title field
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [1, "Title must be at least 1 character long"],
      maxlength: [100, "Title cannot exceed 100 characters"],
      index: true,
    },

    // Blog image (optional)
    image: {
      type: String,
      default: DEFAULT_POST_IMAGE,
    },

    // Category selection
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "Technology",
        "Health",
        "Lifestyle",
        "Education",
        "Entertainment",
        "Business",
        "Science",
        "Sports",
      ], 
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true, 
  }
);

// Create the Post model from the schema
module.exports =  mongoose.model("Post", postSchema);

