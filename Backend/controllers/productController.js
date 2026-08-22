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

        // ==========================================
        // GET DATA FROM REQUEST
        // ==========================================

        const {
            productId,
            name,
            category,
            price,

            dimensions,
            shape,
            colour,
            material,
            moq,
            customization,

            badge,
            rating,
            newArrival,
            bestSeller,
            description
        } = req.body;


        // ==========================================
        // VALIDATE REQUIRED FIELDS
        // ==========================================

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


        // ==========================================
        // VALIDATE PRODUCT ID
        // ==========================================

        const numericProductId =
            Number(productId);


        if (
            !Number.isInteger(numericProductId) ||
            numericProductId <= 0
        ) {

            return res.status(400).json({

                message:
                    "Product ID must be a valid positive number"

            });

        }


        // ==========================================
        // VALIDATE PRICE
        // ==========================================

        const numericPrice =
            Number(price);


        if (
            !Number.isFinite(numericPrice) ||
            numericPrice < 0
        ) {

            return res.status(400).json({

                message:
                    "Price must be a valid number"

            });

        }


        // ==========================================
        // VALIDATE RATING
        // ==========================================

        const numericRating =
            rating === undefined ||
            rating === ""
                ? 0
                : Number(rating);


        if (
            !Number.isFinite(numericRating) ||
            numericRating < 0 ||
            numericRating > 5
        ) {

            return res.status(400).json({

                message:
                    "Rating must be between 0 and 5"

            });

        }


        // ==========================================
        // VALIDATE MOQ
        // ==========================================

        const numericMoq =
            moq === undefined ||
            moq === ""
                ? 1
                : Number(moq);


        if (
            !Number.isInteger(numericMoq) ||
            numericMoq < 1
        ) {

            return res.status(400).json({

                message:
                    "MOQ must be a number greater than 0"

            });

        }


        // ==========================================
        // CHECK DUPLICATE PRODUCT ID
        // ==========================================

        const existingProduct =
            await Product.findOne({

                productId:
                    numericProductId

            });


        if (existingProduct) {

            return res.status(409).json({

                message:
                    "Product ID already exists"

            });

        }


        // ==========================================
        // MAIN IMAGE
        // ==========================================

        let mainImage = "";


        if (
            req.files &&
            req.files.mainImage &&
            req.files.mainImage.length > 0
        ) {

            mainImage =
                `/uploads/products/${req.files.mainImage[0].filename}`;

        }


        // ==========================================
        // ADDITIONAL IMAGES
        // ==========================================

        let additionalImages = [];


        if (
            req.files &&
            req.files.additionalImages &&
            req.files.additionalImages.length > 0
        ) {

            additionalImages =
                req.files.additionalImages.map(
                    file =>
                        `/uploads/products/${file.filename}`
                );

        }


        // ==========================================
        // CREATE PRODUCT
        // ==========================================

        const product =
            await Product.create({

                // Basic information
                productId:
                    numericProductId,

                name:
                    name.trim(),

                category:
                    category.trim(),

                price:
                    numericPrice,


                // ======================================
                // PRODUCT SPECIFICATIONS
                // ======================================

                dimensions:
                    dimensions
                        ? dimensions.trim()
                        : "",

                shape:
                    shape
                        ? shape.trim()
                        : "",

                colour:
                    colour
                        ? colour.trim()
                        : "",

                material:
                    material
                        ? material.trim()
                        : "",

                moq:
                    numericMoq,

                customization:
                    customization
                        ? customization.trim()
                        : "",


                // ======================================
                // OTHER FIELDS
                // ======================================

                badge:
                    badge
                        ? badge.trim()
                        : "",

                rating:
                    numericRating,

                newArrival:
                    newArrival === true ||
                    newArrival === "true",

                bestSeller:
                    bestSeller === true ||
                    bestSeller === "true",

                description:
                    description.trim(),


                // ======================================
                // IMAGES
                // ======================================

                image:
                    mainImage,

                images:
                    additionalImages

            });


        // ==========================================
        // SUCCESS RESPONSE
        // ==========================================

        return res.status(201).json({

            message:
                "Product created successfully",

            product

        });

    }
    catch (error) {

        console.error(
            "Create product error:",
            error
        );


        return res.status(500).json({

            message:
                "Failed to create product",

            error:
                error.message

        });

    }

};
// =====================================================
// UPDATE PRODUCT
// =====================================================



// =====================================================
// UPDATE PRODUCT
// =====================================================

const updateProduct = async (req, res) => {

    try {

        // ==========================================
        // GET PRODUCT ID FROM URL
        // ==========================================

        const rawProductId = req.params.productId;

        console.log(
            "Update product ID:",
            rawProductId
        );


        // ==========================================
        // VALIDATE PRODUCT ID
        // ==========================================

        const productId = Number(rawProductId);

        if (
            !rawProductId ||
            !Number.isInteger(productId) ||
            productId <= 0
        ) {

            return res.status(400).json({

                message: "Invalid product ID",

                received: rawProductId

            });

        }


        // ==========================================
        // FIND PRODUCT
        // ==========================================

        const product = await Product.findOne({
            productId: productId
        });


        if (!product) {

            return res.status(404).json({

                message: "Product not found"

            });

        }


        // ==========================================
        // BASIC FIELDS
        // ==========================================

        if (req.body.name !== undefined) {

            product.name =
                req.body.name;

        }


        if (req.body.category !== undefined) {

            product.category =
                req.body.category;

        }


        if (req.body.price !== undefined) {

            const price =
                Number(req.body.price);


            if (
                !Number.isFinite(price) ||
                price < 0
            ) {

                return res.status(400).json({

                    message: "Invalid price"

                });

            }


            product.price =
                price;

        }


        if (req.body.description !== undefined) {

            product.description =
                req.body.description;

        }


        if (req.body.badge !== undefined) {

            product.badge =
                req.body.badge;

        }


        // ==========================================
        // RATING
        // ==========================================

        if (req.body.rating !== undefined) {

            const rating =
                Number(req.body.rating);


            if (
                !Number.isFinite(rating) ||
                rating < 0 ||
                rating > 5
            ) {

                return res.status(400).json({

                    message:
                        "Rating must be between 0 and 5"

                });

            }


            product.rating =
                rating;

        }


        // ==========================================
        // BOOLEAN FIELDS
        // ==========================================

        if (req.body.newArrival !== undefined) {

            product.newArrival =
                req.body.newArrival === true ||
                req.body.newArrival === "true";

        }


        if (req.body.bestSeller !== undefined) {

            product.bestSeller =
                req.body.bestSeller === true ||
                req.body.bestSeller === "true";

        }


        // ==========================================
        // SPECIFICATIONS
        // ==========================================

        // Dimensions
        if (req.body.dimensions !== undefined) {

            product.dimensions =
                req.body.dimensions;

        }


        // Shape
        if (req.body.shape !== undefined) {

            product.shape =
                req.body.shape;

        }


        // Colour
        if (req.body.colour !== undefined) {

            product.colour =
                req.body.colour;

        }


        // Material
        if (req.body.material !== undefined) {

            product.material =
                req.body.material;

        }


        // Customization
        if (req.body.customization !== undefined) {

            product.customization =
                req.body.customization;

        }


        // ==========================================
        // MOQ
        // ==========================================

        if (req.body.moq !== undefined) {

            const moq =
                Number(req.body.moq);


            if (
                !Number.isInteger(moq) ||
                moq < 1
            ) {

                return res.status(400).json({

                    message:
                        "MOQ must be a number greater than 0"

                });

            }


            product.moq =
                moq;

        }


        // ==========================================
        // MAIN IMAGE
        // ==========================================

        if (
            req.files &&
            req.files.mainImage &&
            req.files.mainImage.length > 0
        ) {

            product.image =
                `/uploads/products/${req.files.mainImage[0].filename}`;

        }


        // ==========================================
        // ADDITIONAL IMAGES
        // ==========================================

        if (
            req.files &&
            req.files.additionalImages &&
            req.files.additionalImages.length > 0
        ) {

            const uploadedImages =
                req.files.additionalImages.map(
                    file =>
                        `/uploads/products/${file.filename}`
                );


            product.images = [
                ...(product.images || []),
                ...uploadedImages
            ];

        }


        // ==========================================
        // SAVE PRODUCT
        // ==========================================

        await product.save();


        // ==========================================
        // RESPONSE
        // ==========================================

        return res.status(200).json({

            message:
                "Product updated successfully",

            product: product

        });

    }
    catch (error) {

        console.error(
            "Update product error:",
            error
        );


        return res.status(500).json({

            message:
                "Failed to update product",

            error:
                error.message

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


        // Prevent NaN from reaching Mongoose
        if (
            !Number.isInteger(productId) ||
            productId <= 0
        ) {

            return res.status(400).json({
                message: "Invalid product ID."
            });

        }


        const product =
            await Product.findOneAndDelete({
                productId: productId
            });


        if (!product) {

            return res.status(404).json({
                message: "Product not found."
            });

        }


        return res.status(200).json({

            message:
                "Product deleted successfully.",

            product

        });


    } catch (error) {

        console.error(
            "Delete product error:",
            error
        );


        return res.status(500).json({

            message:
                "Failed to delete product.",

            error:
                error.message

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