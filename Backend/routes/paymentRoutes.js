const express = require("express");

const {
    createOrder,
    verifyPayment,
    handleWebhook
} = require("../controllers/paymentController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/webhook", handleWebhook);

router.post(
    "/create-order",
    authMiddleware,
    createOrder
);

router.post(
    "/verify",
    authMiddleware,
    verifyPayment
);

module.exports = router;