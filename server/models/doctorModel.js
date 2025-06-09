const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      auto: true, // Auto-generates unique ID
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
    specialization: {
      type: String,
      required: [true, "Please provide a specialization"],
      trim: true,
    },
    experience: {
      type: Number,
      required: [true, "Please provide experience in years"],
      min: 0,
    },
    role: {
      type: String,
      default: "doctor", // Default role as "doctor"
      enum: ["doctor","user"], // Only "doctor" allowed for this model
    },
    profilePic: {
      type: String,
      default: "https://example.com/default-profile.png", // Default profile pic
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Doctor", doctorSchema);
