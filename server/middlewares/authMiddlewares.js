const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const Doctor = require("../models/doctorModel");

// Middleware to verify user token and protect routes
exports.requireSignIn = async (req, res, next) => {
  try {
    // Check if Authorization header exists
    if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const token = req.headers.authorization.split(" ")[1]; // Get token from headers

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    // Verify token and decode
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // First try to find a user
    req.user = await User.findById(decoded._id).select("-password");

    // If no user found, try to find a doctor
    if (!req.user) {
      req.user = await Doctor.findById(decoded._id).select("-password");
    }

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    console.log("Authenticated user/doctor:", req.user._id, req.user.role);
    
    next(); // Proceed to the next middleware or controller
  } catch (error) {
    console.error("Auth error:", error);
    res.status(401).json({ message: "Authentication failed. Please log in again." });
  }
};

// Middleware to restrict access to admin routes
exports.requireAdmin = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }
    next();
  } catch (error) {
    console.error("Admin auth error:", error);
    res.status(403).json({ message: "Access denied. Admin privileges required." });
  }
};

// Middleware to restrict access to doctor routes
exports.requireDoctor = async (req, res, next) => {
  try {
    if (req.user.role !== "doctor") {
      return res.status(403).json({ message: "Access denied. Doctor only." });
    }
    next();
  } catch (error) {
    console.error("Doctor auth error:", error);
    res.status(403).json({ message: "Access denied. Doctor privileges required." });
  }
};
