const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const Admin = require("../models/Admin");


// =====================================================
// USER REGISTER
// =====================================================

const registerUser = async (req, res) => {

    try {

        const { name, email, phone, password } = req.body;

        // Validate input
        if (!name || !email || !phone || !password) {

            return res.status(400).json({
                message: "Name, email and password are required"
            });

        }


        // Check whether user already exists
        const existingUser =
            await User.findOne({
                email: email.toLowerCase()
            });


        if (existingUser) {

            return res.status(409).json({
                message: "User already exists"
            });

        }


        // Hash password
        const hashedPassword =
            await bcrypt.hash(password, 10);


        // Create user
        const user =
    await User.create({

        name: name,

        email: email.toLowerCase(),

        phone: phone,

        password: hashedPassword,

        role: "user"

    });


        res.status(201).json({

            message: "User registered successfully",

            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }

        });

    }
    catch (error) {

        console.error(
            "User registration error:",
            error
        );

        res.status(500).json({
            message: "Server error"
        });

    }

};


// =====================================================
// USER LOGIN
// =====================================================

const loginUser = async (req, res) => {

    try {

        const { email, password } = req.body;


        if (!email || !password) {

            return res.status(400).json({
                message: "Email and password are required"
            });

        }


        // Find user
        const user =
            await User.findOne({
                email: email.toLowerCase()
            });


        if (!user) {

            return res.status(401).json({
                message: "Invalid email or password"
            });

        }


        // Compare password
        const passwordMatch =
            await bcrypt.compare(
                password,
                user.password
            );


        if (!passwordMatch) {

            return res.status(401).json({
                message: "Invalid email or password"
            });

        }


        // Create JWT
        const token =
            jwt.sign(

                {
                    id: user._id,
                    role: user.role
                },

                process.env.JWT_SECRET,

                {
                    expiresIn: "30d"
                }

            );


        res.status(200).json({

            message: "Login successful",

            token: token,

            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }

        });

    }
    catch (error) {

        console.error(
            "User login error:",
            error
        );

        res.status(500).json({
            message: "Server error"
        });

    }

};


// =====================================================
// ADMIN LOGIN
// =====================================================
const loginAdmin = async (req, res) => {

    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        // Check static admin credentials from .env
        if (
            email.toLowerCase() !== process.env.ADMIN_EMAIL.toLowerCase() ||
            password !== process.env.ADMIN_PASSWORD
        ) {
            return res.status(401).json({
                message: "Invalid admin credentials"
            });
        }

        // Create JWT for admin
        const token = jwt.sign(
            {
                email: process.env.ADMIN_EMAIL,
                role: "admin"
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        res.status(200).json({

            message: "Admin login successful",

            token: token,

            admin: {
                email: process.env.ADMIN_EMAIL,
                role: "admin"
            }

        });

    } catch (error) {

        console.error("Admin login error:", error);

        res.status(500).json({
            message: "Server error"
        });

    }

};

module.exports = {
    registerUser,
    loginUser,
    loginAdmin
};