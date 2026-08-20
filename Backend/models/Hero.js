const mongoose = require("mongoose");

const heroSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },

        subtitle: {
            type: String,
            default: ""
        },

        description: {
            type: String,
            default: ""
        },

        image: {
            type: String,
            required: true
        },

        buttonText: {
            type: String,
            default: "Shop Now"
        },

        buttonLink: {
            type: String,
            default: "index.html#gallery"
        },

        active: {
            type: Boolean,
            default: true
        },

        order: {
            type: Number,
            default: 1
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Hero", heroSchema);