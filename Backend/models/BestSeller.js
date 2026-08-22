const mongoose = require("mongoose");

const bestSellerSchema = new mongoose.Schema(
    {
        productId: {
            type: Number,
            required: true
        },

        name: {
            type: String,
            required: true
        },

        image: {
            type: String,
            required: true
        },

        price: {
            type: Number,
            default: 0
        },

        active: {
            type: Boolean,
            default: true
        },

        order: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "BestSeller",
    bestSellerSchema
);