const mongoose = require("mongoose");

const scrollCategorySchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },

        image: {
            type: String,
            required: true
        },

        link: {
            type: String,
            default: "#"
        },

        count: {
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
    "ScrollCategory",
    scrollCategorySchema
);