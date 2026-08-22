const mongoose = require("mongoose");

const standoutSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            default: "What Makes Shailu's Concepts Stand Out?"
        },

        image: {
            type: String,
            required: true
        },

        active: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "Standout",
    standoutSchema
);