const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        // ==========================================
        // PRODUCT ID
        // ==========================================

        productId: {
            type: Number,
            required: true,
            unique: true
        },


        // ==========================================
        // BASIC PRODUCT INFORMATION
        // ==========================================

        name: {
            type: String,
            required: true,
            trim: true
        },

        category: {
            type: String,
            required: true,
            trim: true
        },


        // ==========================================
        // IMAGES
        // ==========================================

        image: {
            type: String,
            default: ""
        },

        images: {
            type: [String],
            default: []
        },


        // ==========================================
        // PRICE
        // ==========================================

        price: {
            type: Number,
            required: true,
            min: 0
        },


        // ==========================================
        // BADGE
        // ==========================================

        badge: {
            type: String,
            default: "",
            trim: true
        },


        // ==========================================
        // RATING
        // ==========================================

        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },


        // ==========================================
        // FLAGS
        // ==========================================

        newArrival: {
            type: Boolean,
            default: false
        },

        bestSeller: {
            type: Boolean,
            default: false
        },


        // ==========================================
        // DESCRIPTION
        // ==========================================

        description: {
            type: String,
            required: true,
            trim: true
        },


        // ==========================================
        // PRODUCT SPECIFICATIONS
        // ==========================================

        dimensions: {
            type: String,
            default: "",
            trim: true
        },

        shape: {
            type: String,
            default: "",
            trim: true
        },

        colour: {
            type: String,
            default: "",
            trim: true
        },
        
            material: {
            type: String,
            default: "",
            trim: true
        },

        moq: {
            type: Number,
            default: 1,
            min: 1
        },

        customization: {
            type: String,
            default: "",
            trim: true
        }
    },

    {
        timestamps: true
    }
);


module.exports =
    mongoose.model(
        "Product",
        productSchema
    );