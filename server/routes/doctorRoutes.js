const express = require("express");
const { 
    registerDoctorController, 
    loginDoctorController, 
    updateDoctorController, 
    getAllDoctorsController,
    getDoctorProfileController,
    requireSignIn
} = require("../controllers/doctorController");

const router = express.Router();

router.post("/register-doctor", registerDoctorController);
router.post("/login-doctor", loginDoctorController);
router.post("/update-doctor", requireSignIn, updateDoctorController);
router.get("/get-all-doctors", getAllDoctorsController);
router.get("/profile", requireSignIn, getDoctorProfileController);

module.exports = router;
