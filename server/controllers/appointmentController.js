const Appointment = require("../models/appointmentModel");
const Doctor = require("../models/doctorModel");
const User = require("../models/userModel");

// Generate a unique booking ID
const generateBookingId = () => {
  const prefix = "BK";
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
  return `${prefix}${timestamp}${random}`;
};

// Create a new appointment
const createAppointment = async (req, res) => {
  try {
    const {
      doctorId,
      appointmentDate,
      appointmentTime,
      consultationType,
      notes,
      paymentMethod,
    } = req.body;

    // Validate required fields
    if (!doctorId || !appointmentDate || !appointmentTime || !consultationType || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Get user ID from authenticated user
    const userId = req.user._id;

    // Find the doctor
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    // Calculate fees
    const consultationFee = 500; // Base consultation fee
    const platformFee = 50; // Platform fee
    const totalAmount = consultationFee + platformFee;

    // Generate a unique booking ID
    const bookingId = generateBookingId();

    // Create new appointment
    const appointment = new Appointment({
      bookingId,
      userId,
      doctorId,
      doctorName: doctor.name,
      specialization: doctor.specialization,
      appointmentDate,
      appointmentTime,
      consultationType,
      notes: notes || "",
      paymentMethod,
      paymentStatus: "completed", // For now, assume payment is completed
      totalAmount,
      consultationFee,
      platformFee,
    });

    // Save appointment to database
    await appointment.save();

    res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      data: appointment,
    });
  } catch (error) {
    console.error("Error booking appointment:", error);
    res.status(500).json({
      success: false,
      message: "Error booking appointment",
      error: error.message,
    });
  }
};

// Get all appointments for a user
const getUserAppointments = async (req, res) => {
  try {
    const userId = req.user._id;

    const appointments = await Appointment.find({ userId })
      .sort({ appointmentDate: -1, appointmentTime: -1 })
      .exec();

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    console.error("Error fetching user appointments:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching appointments",
      error: error.message,
    });
  }
};

// Get all appointments for a doctor
const getDoctorAppointments = async (req, res) => {
  try {
    const doctorId = req.user._id;
    
    console.log("Fetching appointments for doctor:", doctorId);

    // Find appointments for this doctor
    const appointments = await Appointment.find({ doctorId })
      .sort({ appointmentDate: -1, appointmentTime: -1 })
      .exec();
    
    console.log(`Found ${appointments.length} appointments for doctor ${doctorId}`);

    // Populate user information for each appointment
    const appointmentsWithUserInfo = await Promise.all(
      appointments.map(async (appointment) => {
        try {
          const user = await User.findById(appointment.userId).select("name email phone");
          return {
            ...appointment.toObject(),
            userName: user ? user.name : "Patient",
            userEmail: user ? user.email : "",
            userPhone: user ? user.phone : "",
          };
        } catch (err) {
          console.error("Error fetching user info for appointment:", err);
          return {
            ...appointment.toObject(),
            userName: "Patient",
            userEmail: "",
            userPhone: "",
          };
        }
      })
    );

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointmentsWithUserInfo,
    });
  } catch (error) {
    console.error("Error fetching doctor appointments:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching appointments",
      error: error.message,
    });
  }
};

// Get appointment by ID
const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findById(id);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    // Check if the user is authorized to view this appointment
    if (
      appointment.userId.toString() !== req.user._id.toString() &&
      appointment.doctorId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this appointment",
      });
    }

    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    console.error("Error fetching appointment:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching appointment",
      error: error.message,
    });
  }
};

// Update appointment status
const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    console.log(`Updating appointment ${id} status to ${status}`);
    console.log("User in request:", req.user._id, req.user.role);

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Please provide status",
      });
    }

    const appointment = await Appointment.findById(id);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }
    
    console.log("Appointment doctorId:", appointment.doctorId);
    console.log("User _id:", req.user._id);

    // Only doctor can update appointment status
    if (appointment.doctorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this appointment",
      });
    }

    appointment.status = status;
    await appointment.save();

    // Get user info for the updated appointment
    const user = await User.findById(appointment.userId).select("name email phone");
    
    const appointmentWithUserInfo = {
      ...appointment.toObject(),
      userName: user ? user.name : "Patient",
      userEmail: user ? user.email : "",
      userPhone: user ? user.phone : "",
    };

    res.status(200).json({
      success: true,
      message: "Appointment status updated successfully",
      data: appointmentWithUserInfo,
    });
  } catch (error) {
    console.error("Error updating appointment status:", error);
    res.status(500).json({
      success: false,
      message: "Error updating appointment status",
      error: error.message,
    });
  }
};

// Cancel appointment
const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findById(id);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    // Check if the user is authorized to cancel this appointment
    if (
      appointment.userId.toString() !== req.user._id.toString() &&
      appointment.doctorId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to cancel this appointment",
      });
    }

    // Check if appointment is already completed
    if (appointment.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel a completed appointment",
      });
    }

    appointment.status = "cancelled";
    await appointment.save();

    res.status(200).json({
      success: true,
      message: "Appointment cancelled successfully",
      data: appointment,
    });
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    res.status(500).json({
      success: false,
      message: "Error cancelling appointment",
      error: error.message,
    });
  }
};

module.exports = {
  createAppointment,
  getUserAppointments,
  getDoctorAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  cancelAppointment,
};