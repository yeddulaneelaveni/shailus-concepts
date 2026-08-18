const express = require("express");

const {
    getProducts,
    getProductById,
    getSimilarProducts
} = require("../controllers/productController");

const router = express.Router();

// Get all products
router.get("/", getProducts);

// Get similar products
router.get("/:id/similar", getSimilarProducts);

// Get single product
router.get("/:id", getProductById);

module.exports = router;