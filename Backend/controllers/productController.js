const Product = require("../models/Product");


// =====================================================
// GET ALL PRODUCTS
// =====================================================

const getProducts = async (req, res) => {

    try {

        const products =
            await Product
                .find()
                .sort({ productId: 1 });


        res.status(200).json(products);

    } catch (error) {

        console.error(
            "Get products error:",
            error
        );

        res.status(500).json({
            message: "Failed to fetch products"
        });

    }
};


// =====================================================
// GET SINGLE PRODUCT
// =====================================================

const getProductById = async (req, res) => {

    try {

        const productId =
            Number(req.params.productId);


        const product =
            await Product.findOne({
                productId: productId
            });


        if (!product) {

            return res.status(404).json({
                message: "Product not found"
            });

        }


        res.status(200).json(product);

    } catch (error) {

        console.error(
            "Get product error:",
            error
        );

        res.status(500).json({
            message: "Failed to fetch product"
        });

    }
};


// =====================================================
// CREATE PRODUCT
// =====================================================

const createProduct = async (req, res) => {

    try {

        const {
            productId,
            name,
            category,
            price,
            badge,
            rating,
            newArrival,
            bestSeller,
            description,
            dimensions
        } = req.body;


        // -----------------------------
        // VALIDATION
        // -----------------------------

        if (
            productId === undefined ||
            !name ||
            !category ||
            price === undefined ||
            !description
        ) {

            return res.status(400).json({
                message:
                    "Required product fields are missing"
            });

        }


        // -----------------------------
        // CHECK DUPLICATE PRODUCT ID
        // -----------------------------

        const existingProduct =
            await Product.findOne({
                productId: Number(productId)
            });


        if (existingProduct) {

            return res.status(409).json({
                message:
                    "Product ID already exists"
            });

        }


        // -----------------------------
        // MAIN IMAGE
        // -----------------------------

        let mainImage = "";


        if (
            req.files &&
            req.files.mainImage &&
            req.files.mainImage.length > 0
        ) {

            mainImage =
                `/uploads/products/${req.files.mainImage[0].filename}`;

        }


        // -----------------------------
        // ADDITIONAL IMAGES
        // -----------------------------

        let additionalImages = [];


        if (
            req.files &&
            req.files.additionalImages
        ) {

            additionalImages =
                req.files.additionalImages.map(
                    file =>
                        `/uploads/products/${file.filename}`
                );

        }


        // -----------------------------
        // CREATE PRODUCT
        // -----------------------------

        const product =
            await Product.create({

                productId:
                    Number(productId),

                name,

                category,

                image:
                    mainImage,

                images:
                    additionalImages,

                price:
                    Number(price),

                badge:
                    badge || "",

                rating:
                    Number(rating) || 0,

                newArrival:
                    newArrival === "true",

                bestSeller:
                    bestSeller === "true",

                description,

                dimensions:
                    dimensions || ""

            });


        res.status(201).json({

            message:
                "Product created successfully",

            product

        });

    } catch (error) {

        console.error(
            "Create product error:",
            error
        );

        res.status(500).json({

            message:
                "Failed to create product"

        });

    }
};


// =====================================================
// UPDATE PRODUCT
// =====================================================

const updateProduct = async (req, res) => {

    try {

        const productId =
            Number(req.params.productId);


        const product =
            await Product.findOne({
                productId: productId
            });


        if (!product) {

            return res.status(404).json({

                message:
                    "Product not found"

            });

        }


        const {
            name,
            category,
            price,
            badge,
            rating,
            newArrival,
            bestSeller,
            description,
            dimensions
        } = req.body;


        // -----------------------------
        // UPDATE TEXT FIELDS
        // -----------------------------

        if (name !== undefined)
            product.name = name;


        if (category !== undefined)
            product.category = category;


        if (price !== undefined)
            product.price = Number(price);


        if (badge !== undefined)
            product.badge = badge;


        if (rating !== undefined)
            product.rating = Number(rating);


        if (newArrival !== undefined)
            product.newArrival =
                newArrival === "true";


        if (bestSeller !== undefined)
            product.bestSeller =
                bestSeller === "true";


        if (description !== undefined)
            product.description =
                description;


        if (dimensions !== undefined)
            product.dimensions =
                dimensions;


        // -----------------------------
        // UPDATE MAIN IMAGE
        // -----------------------------

        if (
            req.files &&
            req.files.mainImage &&
            req.files.mainImage.length > 0
        ) {

            product.image =
                `/uploads/products/${req.files.mainImage[0].filename}`;

        }


        // -----------------------------
        // UPDATE ADDITIONAL IMAGES
        // -----------------------------

        if (
            req.files &&
            req.files.additionalImages &&
            req.files.additionalImages.length > 0
        ) {

            product.images =
                req.files.additionalImages.map(
                    file =>
                        `/uploads/products/${file.filename}`
                );

        }


        await product.save();


        res.status(200).json({

            message:
                "Product updated successfully",

            product

        });

    } catch (error) {

        console.error(
            "Update product error:",
            error
        );

        res.status(500).json({

            message:
                "Failed to update product"

        });

    }
};


// =====================================================
// DELETE PRODUCT
// =====================================================

const deleteProduct = async (req, res) => {

    try {

        const productId =
            Number(req.params.productId);


        const product =
            await Product.findOneAndDelete({
                productId: productId
            });


        if (!product) {

            return res.status(404).json({

                message:
                    "Product not found"

            });

        }


        res.status(200).json({

            message:
                "Product deleted successfully"

        });

    } catch (error) {

        console.error(
            "Delete product error:",
            error
        );

        res.status(500).json({

            message:
                "Failed to delete product"

        });

    }
};


module.exports = {

    getProducts,

    getProductById,

    createProduct,

    updateProduct,

    deleteProduct

};