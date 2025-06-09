const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      auto: true, // Automatically generates unique ID
    },
    name: {
      type: String,
      required: [true, "Please provide a name"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: 6,
      maxLength: 64,
    },
    phone: {
      type: String,
      required: [true, "Please provide a phone number"],
      unique: true,
      trim: true,
    },
    city: {
      type: String,
      required: [true, "Please provide a city"],
      trim: true,
    },
    role: {
      type: String,
      default: "user", // Default role as "user"
      enum: ["user", "doctor"], // Only "user" or "doctor" allowed
    },
    profilePic: {
      type: String,
      default: "https://example.com/default-profile.png", // Default profile pic
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
