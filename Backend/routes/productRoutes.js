const express = require("express");

const router = express.Router();

const {
    getProducts,
    getProductById,
    getProductRelated,
    createProduct,
    updateProduct,
    deleteProduct
} = require("../controllers/productController");

const adminMiddleware = require("../middleware/adminMiddleware");
const upload = require("../middleware/uploadMiddleware");


// =====================================================
// PUBLIC ROUTES
// =====================================================

router.get("/", getProducts);
router.get("/:productId/related", getProductRelated);
router.get("/:productId", getProductById);


// =====================================================
// ADMIN PRODUCT ROUTES
// =====================================================

// Create product with:
// mainImage = one image
// additionalImages = multiple images

router.post(
    "/",
    adminMiddleware,
    upload.fields([
        {
            name: "mainImage",
            maxCount: 1
        },
        {
            name: "additionalImages",
            maxCount: 10
        }
    ]),
    createProduct
);


// Update product

router.put(
    "/:productId",
    adminMiddleware,
    upload.fields([
        {
            name: "mainImage",
            maxCount: 1
        },
        {
            name: "additionalImages",
            maxCount: 10
        }
    ]),
    updateProduct
);


// Delete product

router.delete(
    "/:productId",
    adminMiddleware,
    deleteProduct
);


module.exports = router;