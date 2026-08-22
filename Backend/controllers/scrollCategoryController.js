const ScrollCategory = require("../models/ScrollCategory");

// GET all active scroll categories
exports.getScrollCategories = async (req, res) => {
    try {
        const categories = await ScrollCategory.find({
            active: true
        }).sort({ order: 1 });

        res.json(categories);

    } catch (error) {
        console.error("Get scroll categories error:", error);

        res.status(500).json({
            message: "Failed to fetch scroll categories"
        });
    }
};


// CREATE scroll category
exports.createScrollCategory = async (req, res) => {
    try {

        const {
            title,
            link,
            count,
            active,
            order
        } = req.body;

        const image = req.file
            ? `/uploads/scroll/${req.file.filename}`
            : "";

        if (!title || !image) {
            return res.status(400).json({
                message: "Title and image are required"
            });
        }

        const category = await ScrollCategory.create({
            title,
            image,
            link: link || "#",
            count: Number(count) || 0,
            active: active !== "false",
            order: Number(order) || 0
        });

        res.status(201).json(category);

    } catch (error) {
        console.error("Create scroll category error:", error);

        res.status(500).json({
            message: "Failed to create scroll category"
        });
    }
};


// UPDATE scroll category
exports.updateScrollCategory = async (req, res) => {
    try {

        const category = await ScrollCategory.findById(
            req.params.id
        );

        if (!category) {
            return res.status(404).json({
                message: "Scroll category not found"
            });
        }

        const {
            title,
            link,
            count,
            active,
            order
        } = req.body;

        if (title !== undefined) {
            category.title = title;
        }

        if (link !== undefined) {
            category.link = link;
        }

        if (count !== undefined) {
            category.count = Number(count);
        }

        if (active !== undefined) {
            category.active =
                active === true ||
                active === "true";
        }

        if (order !== undefined) {
            category.order = Number(order);
        }

        if (req.file) {
            category.image =
                `/uploads/scroll/${req.file.filename}`;
        }

        await category.save();

        res.json(category);

    } catch (error) {
        console.error("Update scroll category error:", error);

        res.status(500).json({
            message: "Failed to update scroll category"
        });
    }
};


// DELETE scroll category
exports.deleteScrollCategory = async (req, res) => {
    try {

        const category =
            await ScrollCategory.findByIdAndDelete(
                req.params.id
            );

        if (!category) {
            return res.status(404).json({
                message: "Scroll category not found"
            });
        }

        res.json({
            message: "Scroll category deleted successfully"
        });

    } catch (error) {
        console.error("Delete scroll category error:", error);

        res.status(500).json({
            message: "Failed to delete scroll category"
        });
    }
};