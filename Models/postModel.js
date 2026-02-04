
const mongoose = require('mongoose')  


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
      default: "https://img.freepik.com/premium-vector/illustration-vector-graphic-cartoon-character-blogging_516790-1495.jpg?semt=ais_hybrid&w=740", // Default placeholder image
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
      ], 
    },
  },
  {
    timestamps: true, 
  }
);

// Create the Post model from the schema
module.exports =  mongoose.model("Post", postSchema);

