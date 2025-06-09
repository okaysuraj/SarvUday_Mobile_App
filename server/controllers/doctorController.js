const JWT = require("jsonwebtoken");

const doctorModel = require("../models/doctorModel");
const {hashPassword} = require("../helpers/authHelper");
const {comparePassword} = require("../helpers/authHelper");
var { expressjwt: jwt } = require('express-jwt')

const requireSignIn = jwt({
  secret: process.env.JWT_SECRET, algorithms: ["HS256"],
})
const registerDoctorController = async (req,res) => {
  try {
      const {name, email, password, city, phone, specialization, experience,role} = req.body
      if (!name ) {
          
          return res.status(400).send({success: false, message: "Please give your name"})
      }
      if (!email ) {
          
          return res.status(400).send({success: false, message: "Please fill your email"})
      }
      if (!city ) {
          
          return res.status(400).send({success: false, message: "Please give your city"})
      }
      if (!phone ) {
          
          return res.status(400).send({success: false, message: "Please give your Phone number"})
      }
      if (!specialization ) {
          
        return res.status(400).send({success: false, message: "Please give your specialization"})
    }
    if (!experience ) {
          
      return res.status(400).send({success: false, message: "Please give your experience"})
  }
      if (!password ) {
          
          return res.status(400).send({success: false, message: "Please give your Password"})
      }
      if (password.length < 6) {
          
          return res.status(400).send({success: false, message: "your password should be between 6 and 20 characters"})
      }
    const existingUser = await doctorModel.findOne({email})
    if (existingUser) {
      return res.status(500).send({ success:false,message: "Doctor already exists" });
    }

    const hashedPassword = await hashPassword(password);

    const doctor = await doctorModel({name,
       email,
        password:hashedPassword, 
        city, phone,
         specialization,
          experience,
          role:"doctor",
        }).save();
    return res.status(201).send({success:true,message: "Doctor created successfully"})
  } catch (error){
      console.log(error)
      return res.status(500).send({success:false,message: "Error in Register API"})
  }
};

const loginDoctorController = async (req, res) => {
  try {
    const { email, password } = req.body;

  if (!email || !password) {
              
              return res.status(400).send({success: false, message: "Please fill your email and Password"})
          }
          const doctor = await doctorModel.findOne({email})
          if (!doctor) {
              return res.status(400).send({success:false,message: "Invalid email or password"})
          }
          const passwordMatch = await comparePassword(password, doctor.password)
          if (!passwordMatch) {
              return res.status(400).send({success:false,message: "Invalid email or password"})
          }
    // Generate JWT Token
       const token = await JWT.sign({_id: doctor._id}, process.env.JWT_SECRET, {expiresIn: "200d"})
         doctor.password = undefined
         res.status(200).send({success:true,message: "Login Successful",token,doctor})
 }catch (error){
     console.log(error)
     return res.status(500).send({success:false,message: "Error in Login API",error})
 }
}
const updateDoctorController = async (req, res) => {
    try{
        
        const {name,password,email,city,phone,specialization,experience}= req.body
        const doctor = await doctorModel.findOne({email})
        if(password && password.length<6){
            return res.status(400).send({
                success:false,
                message:'Password is required and should be atleast 6 character long'
            })
        }
        
            const hashedPassword = password ? await hashPassword(password) : undefined
            const updatedUser = await doctorModel.findOneAndUpdate({email},{
                name: name || doctor.name ,
                city: city || doctor.city,
                phone: phone || doctor.phone,
                specialization: specialization || doctor.specialization,
                experience: experience || doctor.experience,
                password: hashedPassword || doctor.password
            },{new:true})
            updatedUser.password = undefined
            res.status(200).send({
                success:true,
                message: 'Profile updated please login',
                updatedUser
            })
    }catch (error){
        console.log(error)
        res.status(500).send({
            success:false,
            message:'Error in user update Api'

        })
    }
}
// Get all doctors
const getAllDoctorsController = async (req, res) => {
    try {
        // Fetch all doctors, excluding sensitive information
        const doctors = await doctorModel.find({})
            .select('-password -email -phone -__v')
            .sort({ createdAt: -1 });
        
        res.status(200).send({
            success: true,
            message: "Doctors fetched successfully",
            doctors
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error in fetching doctors",
            error
        });
    }
};

// Get doctor profile by ID
const getDoctorProfileController = async (req, res) => {
    try {
        // Get doctor ID from auth middleware
        const doctorId = req.auth._id;
        console.log("Getting doctor profile for ID:", doctorId);
        
        // Find doctor by ID
        const doctor = await doctorModel.findById(doctorId).select("-password");
        
        if (!doctor) {
            return res.status(404).send({
                success: false,
                message: "Doctor not found"
            });
        }
        
        res.status(200).send({
            success: true,
            message: "Doctor profile fetched successfully",
            doctor
        });
    } catch (error) {
        console.log("Error in getDoctorProfileController:", error);
        res.status(500).send({
            success: false,
            message: "Error in getting doctor profile",
            error: error.message
        });
    }
};

module.exports = {
    registerDoctorController, 
    loginDoctorController, 
    updateDoctorController, 
    getAllDoctorsController,
    getDoctorProfileController,
    requireSignIn
};
