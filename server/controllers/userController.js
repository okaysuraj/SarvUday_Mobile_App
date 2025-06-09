const JWT = require("jsonwebtoken");

const userModel = require("../models/userModel");
const {hashPassword} = require("../helpers/authHelper");
const {comparePassword} = require("../helpers/authHelper");
var { expressjwt: jwt } = require('express-jwt')

const requireSignIn = jwt({
    secret: process.env.JWT_SECRET, algorithms: ["HS256"],
})

const registerController = async (req,res) => {
    try {
        const {name, email, password, city, phone,role} = req.body
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
        if (!password ) {
            
            return res.status(400).send({success: false, message: "Please give your Password"})
        }
        if (password.length < 6) {
            
            return res.status(400).send({success: false, message: "your password should be between 6 and 20 characters"})
        }
        const existingUser = await userModel.findOne({email})
        if (existingUser) {
            return res.status(500).send({success:false,message: "An account with this email already exists"})
        }

        const hashedPassword = await hashPassword(password)
        const user = await userModel({name, email, password:hashedPassword,city,phone}).save()
        return res.status(201).send({success:true,message: "User created successfully"})
    } catch (error){
        console.log(error)
        return res.status(500).send({success:false,message: "Error in Register API"})
    }

};
const loginController = async (req,res) => {
    try {
        const {email, password} = req.body
        if (!email || !password) {
            
            return res.status(400).send({success: false, message: "Please fill your email and Password"})
        }
        const user = await userModel.findOne({email})
        if (!user) {
            return res.status(400).send({success:false,message: "Invalid email or password"})
        }
        const passwordMatch = await comparePassword(password, user.password)
        if (!passwordMatch) {
            return res.status(400).send({success:false,message: "Invalid email or password"})
        }

        const token = await JWT.sign({_id: user._id}, process.env.JWT_SECRET, {expiresIn: "200d"})
        user.password = undefined
        res.status(200).send({success:true,message: "Login Successful",token,user})
}catch (error){
    console.log(error)
    return res.status(500).send({success:false,message: "Error in Login API",error})
}
}
const updateUserController = async (req, res) => {
    try{
        
        const {name,password,email,city,phone}= req.body
        const user = await userModel.findOne({email})
        if(password && password.length<6){
            return res.status(400).send({
                success:false,
                message:'Password is required and should be atleast 6 character long'
            })
        }
        
            const hashedPassword = password ? await hashPassword(password) : undefined
            const updatedUser = await userModel.findOneAndUpdate({email},{
                name: name || user.name ,
                city: city || user.city,
                phone: phone || user.phone,
                password: hashedPassword || user.password
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
module.exports = {registerController, loginController, updateUserController, requireSignIn};