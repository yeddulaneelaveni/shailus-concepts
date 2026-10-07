const express = require("express");
const Order = require("../models/order");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const router = express.Router();

// =====================================================
// GET LOGGED-IN CUSTOMER ORDERS
// =====================================================

router.get("/my", authMiddleware, async (req, res) => {
    try {
        const orders = await Order.find({
            userId: req.user.id
        }).sort({
            createdAt: -1
        });

        res.status(200).json({
            success: true,
            orders: orders
        });

    } catch (error) {
        console.error("Get customer orders error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to fetch your orders"
        });
    }
});

router.get("/my/:orderId", authMiddleware, async (req, res) => {
    try {
        const order = await Order.findOne({
            orderId: req.params.orderId,
            userId: req.user.id
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        return res.status(200).json({
            success: true,
            order
        });
    } catch (error) {
        console.error("Get customer order details error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to fetch your order"
        });
    }
});

// Get all orders
router.get("/", adminMiddleware, async (req, res) => {
    try {
        const orders = await Order.find()
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            orders
        });

    } catch (error) {
        console.error("Get orders error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to fetch orders"
        });
    }
});


// Get single order
router.get("/:orderId", adminMiddleware, async (req, res) => {
    try {
        const order = await Order.findOne({
            orderId: req.params.orderId
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        res.status(200).json({
            success: true,
            order
        });

    } catch (error) {
        console.error("Get single order error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to fetch order"
        });
    }
});


// Update order status
router.patch("/:orderId/status", adminMiddleware, async (req, res) => {
    try {

        const { orderStatus } = req.body;

        const allowedStatuses = [
            "Order Placed",
            "Payment Confirmed",
            "Processing",
            "Packed",
            "Shipped",
            "Out for Delivery",
            "Delivered",
            "Cancelled"
        ];

        if (!allowedStatuses.includes(orderStatus)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order status"
            });
        }

        const order = await Order.findOneAndUpdate(
            {
                orderId: req.params.orderId
            },
            {
                orderStatus
            },
            {
                new: true
            }
        );

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        res.status(200).json({
            success: true,
            order
        });

    } catch (error) {
        console.error("Update order status error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to update order status"
        });
    }
});
// Customer order tracking
router.post("/track", authMiddleware, async (req, res) => {
    try {
        const { orderId, phone } = req.body;

        if (!orderId || !phone) {
            return res.status(400).json({
                success: false,
                message: "Order ID and phone number are required"
            });
        }

        const normalizePhone = (value) =>
            String(value).replace(/\D/g, "");

        const enteredPhone = normalizePhone(phone);

        const order = await Order.findOne({
            orderId: String(orderId).trim(),
            userId: req.user.id
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        const savedPhone = normalizePhone(order.phone);

        if (enteredPhone !== savedPhone) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        // Return only customer-safe information
        res.status(200).json({
            success: true,

            order: {
                orderId: order.orderId,

                customerName: order.customerName,

                items: order.items.map(item => ({
                    name: item.name,
                    image: item.image,
                    quantity: item.quantity,
                    finalPrice: item.finalPrice
                })),

                subtotal: order.subtotal,
                discountPercentage: order.discountPercentage,
                discountAmount: order.discountAmount,
                totalAmount: order.totalAmount,

                paymentStatus: order.paymentStatus,
                orderStatus: order.orderStatus,

                shippingAddress: order.shippingAddress,

                trackingNumber: order.trackingNumber || "",
                carrier: order.carrier || "",
                trackingUrl: order.trackingUrl || "",
                estimatedDeliveryDate:
                    order.estimatedDeliveryDate || null,

                createdAt: order.createdAt,
                updatedAt: order.updatedAt
            }
        });

    } catch (error) {
        console.error("Customer tracking error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to track order"
        });
    }
});

module.exports = router;