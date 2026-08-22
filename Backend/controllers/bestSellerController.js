const BestSeller = require("../models/BestSeller");

// GET best sellers
exports.getBestSellers = async (req, res) => {
    try {

        const bestSellers = await BestSeller.find({
            active: true
        }).sort({ order: 1 });

        res.json(bestSellers);

    } catch (error) {
        console.error("Get best sellers error:", error);

        res.status(500).json({
            message: "Failed to fetch best sellers"
        });
    }
};


// CREATE best seller
exports.createBestSeller = async (req, res) => {
    try {

        const {
            productId,
            name,
            price,
            active,
            order
        } = req.body;

        const image = req.file
            ? `/uploads/best-sellers/${req.file.filename}`
            : "";

        if (!productId || !name || !image) {
            return res.status(400).json({
                message:
                    "Product ID, name and image are required"
            });
        }

        const bestSeller = await BestSeller.create({
            productId: Number(productId),
            name,
            image,
            price: Number(price) || 0,
            active: active !== "false",
            order: Number(order) || 0
        });

        res.status(201).json(bestSeller);

    } catch (error) {
        console.error("Create best seller error:", error);

        res.status(500).json({
            message: "Failed to create best seller"
        });
    }
};


// UPDATE best seller
exports.updateBestSeller = async (req, res) => {
    try {

        const bestSeller =
            await BestSeller.findById(req.params.id);

        if (!bestSeller) {
            return res.status(404).json({
                message: "Best seller not found"
            });
        }

        const {
            productId,
            name,
            price,
            active,
            order
        } = req.body;

        if (productId !== undefined) {
            bestSeller.productId = Number(productId);
        }

        if (name !== undefined) {
            bestSeller.name = name;
        }

        if (price !== undefined) {
            bestSeller.price = Number(price);
        }

        if (active !== undefined) {
            bestSeller.active =
                active === true ||
                active === "true";
        }

        if (order !== undefined) {
            bestSeller.order = Number(order);
        }

        if (req.file) {
            bestSeller.image =
                `/uploads/best-sellers/${req.file.filename}`;
        }

        await bestSeller.save();

        res.json(bestSeller);

    } catch (error) {
        console.error("Update best seller error:", error);

        res.status(500).json({
            message: "Failed to update best seller"
        });
    }
};


// DELETE best seller
exports.deleteBestSeller = async (req, res) => {
    try {

        const bestSeller =
            await BestSeller.findByIdAndDelete(
                req.params.id
            );

        if (!bestSeller) {
            return res.status(404).json({
                message: "Best seller not found"
            });
        }

        res.json({
            message: "Best seller deleted successfully"
        });

    } catch (error) {
        console.error("Delete best seller error:", error);

        res.status(500).json({
            message: "Failed to delete best seller"
        });
    }
};