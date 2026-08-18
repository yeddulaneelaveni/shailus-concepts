const Product = require("../models/Product");

// Get all products
const getProducts = async (req, res) => {
    try {
        const products = await Product.find();

        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch products",
            error: error.message
        });
    }
};

// Get single product by productId
const getProductById = async (req, res) => {
    try {
        const product = await Product.findOne({
            productId: Number(req.params.id)
        });

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch product",
            error: error.message
        });
    }
};

// Get similar products
const getSimilarProducts = async (req, res) => {
    try {
        const product = await Product.findOne({
            productId: Number(req.params.id)
        });

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        const similarProducts = await Product.find({
            category: product.category,
            productId: { $ne: product.productId }
        });

        res.status(200).json(similarProducts);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch similar products",
            error: error.message
        });
    }
};

module.exports = {
    getProducts,
    getProductById,
    getSimilarProducts
};