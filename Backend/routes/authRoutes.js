const express = require("express");

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


module.exports = router;