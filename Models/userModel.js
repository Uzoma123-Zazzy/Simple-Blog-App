const mongoose = require('mongoose') 

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,                                       
      trim: true,                                         
      minlength: [3, "Username must be at least 3 characters long"],
      maxlength: [50, "Username cannot exceed 50 characters"],
    },

    
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,                                       
      trim: true,
      lowercase: true,                                    
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"], 
    },

    
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
      select: false,                                      
    },

    // Optional profile picture
    profilePicture: {
      type: String,
      default: "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541",
    },

    firstName: {
      type: String,
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters"],
      default: "",
    },

    lastName: {
      type: String,
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"],
      default: "",
    },

    bio: {
      type: String,
      trim: true,
      maxlength: [500, "Bio cannot exceed 500 characters"],
      default: "",
    },

    personalWebsite: {
      type: String,
      trim: true,
      default: "",
    },

    socialLinks: {
      twitter: {
        type: String,
        trim: true,
        default: "",
      },
      facebook: {
        type: String,
        trim: true,
        default: "",
      },
      instagram: {
        type: String,
        trim: true,
        default: "",
      },
      linkedin: {
        type: String,
        trim: true,
        default: "",
      },
    },

    country: {
      type: String,
      trim: true,
      default: "",
    },

    profileCompleted: {
      type: Boolean,
      default: false,
    },

    // Admin role flag
    isAdmin: {
      type: Boolean,
      default: false,                                    
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt
  }
);

// Exporting the User model
module.exports = mongoose.model("User", userSchema);
