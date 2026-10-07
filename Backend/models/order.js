const mongoose = require("mongoose");


// =====================================================
// ORDER ITEM SCHEMA
// =====================================================

const orderItemSchema = new mongoose.Schema(
    {
        productId: {
            type: String,
            default: ""
        },

        name: {
            type: String,
            required: true
        },

        image: {
            type: String,
            default: ""
        },

        quantity: {
            type: Number,
            required: true,
            min: 1
        },

        originalPrice: {
            type: Number,
            required: true
        },

        finalPrice: {
            type: Number,
            required: true
        },

        discountPercentage: {
            type: Number,
            default: 0
        }
    },
    {
        _id: false
    }
);


// =====================================================
// ORDER SCHEMA
// =====================================================

const orderSchema = new mongoose.Schema(
    {
        // -------------------------------------------------
        // ORDER INFORMATION
        // -------------------------------------------------

        orderId: {
            type: String,
            required: true,
            unique: true
        },
        userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
},
        customerName: {
            type: String,
            required: true
        },

        email: {
            type: String,
            default: ""
        },

        phone: {
            type: String,
            required: true
        },


        // -------------------------------------------------
        // SHIPPING ADDRESS
        // -------------------------------------------------

        shippingAddress: {
            address: {
                type: String,
                required: true
            },

            apartment: {
                type: String,
                default: ""
            },

            city: {
                type: String,
                required: true
            },

            state: {
                type: String,
                required: true
            },

            country: {
                type: String,
                default: "India"
            },

            pinCode: {
                type: String,
                required: true
            }
        },


        // -------------------------------------------------
        // ORDER ITEMS
        // -------------------------------------------------

        items: {
            type: [orderItemSchema],
            required: true
        },


        // -------------------------------------------------
        // PRICE DETAILS
        // -------------------------------------------------

        subtotal: {
            type: Number,
            required: true
        },

        discountPercentage: {
            type: Number,
            default: 0
        },

        discountAmount: {
            type: Number,
            default: 0
        },

        totalAmount: {
            type: Number,
            required: true
        },


        // -------------------------------------------------
        // RAZORPAY PAYMENT DETAILS
        // -------------------------------------------------

        razorpayOrderId: {
            type: String,
            required: true
        },

        razorpayPaymentId: {
            type: String,
            default: undefined,
            unique: true,
            sparse: true
        },

        paymentStatus: {
            type: String,

            enum: [
                "Pending",
                "Paid",
                "Failed",
                "Refunded"
            ],

            default: "Pending"
        },


        // -------------------------------------------------
        // ORDER STATUS
        // -------------------------------------------------

        orderStatus: {
            type: String,

            enum: [
                "Order Placed",
                "Payment Confirmed",
                "Processing",
                "Packed",
                "Shipped",
                "Out for Delivery",
                "Delivered",
                "Cancelled"
            ],

            default: "Order Placed"
        },


        // -------------------------------------------------
        // SHIPPING / TRACKING
        // -------------------------------------------------

        trackingNumber: {
            type: String,
            default: ""
        },

        carrier: {
            type: String,
            default: ""
        },

        trackingUrl: {
            type: String,
            default: ""
        },

        estimatedDeliveryDate: {
            type: Date,
            default: null
        }
    },


    // -------------------------------------------------
    // AUTOMATIC CREATED / UPDATED DATES
    // -------------------------------------------------

    {
        timestamps: true
    }
);


// =====================================================
// EXPORT MODEL
// =====================================================

module.exports = mongoose.model("Order", orderSchema);