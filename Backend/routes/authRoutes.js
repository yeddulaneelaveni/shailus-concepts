const express = require("express");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

const {
    registerUser,
    loginUser,
    loginAdmin
} = require("../controllers/authController");


// User registration
router.post(
    "/register",
    registerUser
);


// User login
router.post(
    "/login",
    loginUser
);


// Admin login
router.post(
    "/admin-login",
    loginAdmin
);

router.get("/me", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .select("_id name email role");

        if (!user || user.role === "admin") {
            return res.status(401).json({
                success: false,
                message: "Customer session is invalid"
            });
        }

        return res.status(200).json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error("Get customer session error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to validate customer session"
        });
    }
});


module.exports = router;