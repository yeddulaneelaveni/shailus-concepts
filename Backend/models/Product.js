const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        productId: {
            type: Number,
            required: true,
            unique: true
        },

        name: {
            type: String,
            required: true
        },

        category: {
            type: String,
            required: true
        },

        images: {
            type: [String],
            default: []
        },

        image: {
            type: String,
            default: ""
        },

        price: {
            type: Number,
            required: true
        },

        badge: {
            type: String,
            default: ""
        },

        rating: {
            type: Number,
            default: 0
        },

        newArrival: {
            type: Boolean,
            default: false
        },

        bestSeller: {
            type: Boolean,
            default: false
        },

        description: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Product", productSchema);