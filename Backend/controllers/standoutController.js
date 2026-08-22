const Standout = require("../models/Standout");

// GET active standout
exports.getStandout = async (req, res) => {
    try {

        const standout = await Standout.findOne({
            active: true
        }).sort({ createdAt: -1 });

        if (!standout) {
            return res.status(404).json({
                message: "Standout section not found"
            });
        }

        res.json(standout);

    } catch (error) {
        console.error("Get standout error:", error);

        res.status(500).json({
            message: "Failed to fetch standout"
        });
    }
};


// CREATE standout
exports.createStandout = async (req, res) => {
    try {

        const {
            title,
            active
        } = req.body;

        const image = req.file
            ? `/uploads/standout/${req.file.filename}`
            : "";

        if (!image) {
            return res.status(400).json({
                message: "Image is required"
            });
        }

        const standout = await Standout.create({
            title:
                title ||
                "What Makes Shailu's Concepts Stand Out?",

            image,

            active: active !== "false"
        });

        res.status(201).json(standout);

    } catch (error) {
        console.error("Create standout error:", error);

        res.status(500).json({
            message: "Failed to create standout"
        });
    }
};


// UPDATE standout
exports.updateStandout = async (req, res) => {
    try {

        const standout =
            await Standout.findById(req.params.id);

        if (!standout) {
            return res.status(404).json({
                message: "Standout not found"
            });
        }

        if (req.body.title !== undefined) {
            standout.title = req.body.title;
        }

        if (req.body.active !== undefined) {
            standout.active =
                req.body.active === true ||
                req.body.active === "true";
        }

        if (req.file) {
            standout.image =
                `/uploads/standout/${req.file.filename}`;
        }

        await standout.save();

        res.json(standout);

    } catch (error) {
        console.error("Update standout error:", error);

        res.status(500).json({
            message: "Failed to update standout"
        });
    }
};


// DELETE standout
exports.deleteStandout = async (req, res) => {
    try {

        const standout =
            await Standout.findByIdAndDelete(
                req.params.id
            );

        if (!standout) {
            return res.status(404).json({
                message: "Standout deleted successfully"
            });
        }

        res.json({
            message: "Standout deleted successfully"
        });

    } catch (error) {
        console.error("Delete standout error:", error);

        res.status(500).json({
            message: "Failed to delete standout"
        });
    }
};