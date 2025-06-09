const express = require("express");
const router = express.Router();
const {
  createAppointment,
  getUserAppointments,
  getDoctorAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  cancelAppointment,
} = require("../controllers/appointmentController");
const { requireSignIn } = require("../middlewares/authMiddlewares");

// Create a new appointment
router.post("/", requireSignIn, createAppointment);

// Get all appointments for the logged-in user
router.get("/user", requireSignIn, getUserAppointments);

// Get all appointments for the logged-in doctor
router.get("/doctor", requireSignIn, getDoctorAppointments);

// Get appointment by ID
router.get("/:id", requireSignIn, getAppointmentById);

// Update appointment status
router.put("/:id/status", requireSignIn, updateAppointmentStatus);

// Cancel appointment
router.put("/:id/cancel", requireSignIn, cancelAppointment);

module.exports = router;