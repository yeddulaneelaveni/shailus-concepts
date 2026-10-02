const Product = require("../models/Product");

const parseRelatedProductIds = (value) => {
    if (value === undefined || value === null || value === "") return [];

    let values = value;

    if (typeof value === "string") {
        try {
            values = JSON.parse(value);
        } catch (error) {
            values = value.split(",");
        }
    }

    if (!Array.isArray(values)) values = [values];

    return [...new Set(values
        .map(Number)
        .filter(id => Number.isInteger(id) && id > 0))];
};

const getValidRelatedProductIds = async (value, currentProductId) => {
    const ids = parseRelatedProductIds(value)
        .filter(id => id !== Number(currentProductId));

    if (!ids.length) return [];

    const products = await Product.find({
        productId: { $in: ids }
    }).select("productId");

    const validIds = new Set(products.map(product => product.productId));
    return ids.filter(id => validIds.has(id));
};

const normalizeText = (value = "") => String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const getKeywordTokens = (value = "") => {
    const normalized = normalizeText(value);
    if (!normalized) return [];

    const stopWords = new Set([
        "the", "and", "for", "with", "from", "into", "that", "this",
        "your", "more", "gift", "gifts", "return", "custom", "customized",
        "about", "shop", "best", "new", "our", "all", "use", "used"
    ]);

    return normalized
        .split(" ")
        .filter(token => token.length > 2 && !stopWords.has(token));
};

const buildProductKeywords = (product = {}) => {
    const parts = [
        product.name,
        product.category,
        product.shape,
        product.colour,
        product.material,
        product.badge,
        product.description
    ];

    return [...new Set(parts.flatMap(getKeywordTokens))];
};

const calculateRelatedProductScore = (currentProduct, candidateProduct) => {
    if (!currentProduct || !candidateProduct) return 0;
    if (String(currentProduct.productId) === String(candidateProduct.productId)) return 0;

    const currentCategory = normalizeText(currentProduct.category);
    const candidateCategory = normalizeText(candidateProduct.category);
    const currentShape = normalizeText(currentProduct.shape);
    const candidateShape = normalizeText(candidateProduct.shape);
    const currentColour = normalizeText(currentProduct.colour);
    const candidateColour = normalizeText(candidateProduct.colour);
    const currentMaterial = normalizeText(currentProduct.material);
    const candidateMaterial = normalizeText(candidateProduct.material);

    let score = 0;

    if (currentCategory && candidateCategory) {
        if (currentCategory === candidateCategory) score += 60;
        else if (currentCategory.includes(candidateCategory) || candidateCategory.includes(currentCategory)) score += 24;
        else {
            const currentCategoryWords = new Set(getKeywordTokens(currentProduct.category));
            const candidateCategoryWords = new Set(getKeywordTokens(candidateProduct.category));
            const sharedCategoryWords = [...currentCategoryWords].filter(word => candidateCategoryWords.has(word));
            score += sharedCategoryWords.length * 8;
        }
    }

    if (currentShape && candidateShape && currentShape === candidateShape) score += 18;
    if (currentColour && candidateColour && currentColour === candidateColour) score += 12;
    if (currentMaterial && candidateMaterial && currentMaterial === candidateMaterial) score += 12;

    const currentKeywords = new Set(buildProductKeywords(currentProduct));
    const candidateKeywords = new Set(buildProductKeywords(candidateProduct));
    const sharedKeywords = [...currentKeywords].filter(word => candidateKeywords.has(word));
    score += sharedKeywords.length * 6;

    if (currentProduct.name && candidateProduct.name) {
        const currentName = normalizeText(currentProduct.name);
        const candidateName = normalizeText(candidateProduct.name);
        if (currentName.includes(candidateName) || candidateName.includes(currentName)) score += 8;
    }

    if (currentProduct.description && candidateProduct.description) {
        const currentDescriptionWords = new Set(getKeywordTokens(currentProduct.description));
        const candidateDescriptionWords = new Set(getKeywordTokens(candidateProduct.description));
        const sharedDescriptionWords = [...currentDescriptionWords].filter(word => candidateDescriptionWords.has(word));
        score += sharedDescriptionWords.length * 4;
    }

    return score;
};

const getAutomaticRelatedProducts = async (currentProductId) => {
    const currentProduct = await Product.findOne({ productId: Number(currentProductId) });

    if (!currentProduct) {
        return [];
    }

    const allProducts = await Product.find({
        productId: { $ne: Number(currentProductId) }
    }).sort({ createdAt: -1, productId: -1 }).lean();

    if (!allProducts.length) {
        return [];
    }

    const scoredProducts = allProducts
        .map(product => ({
            product,
            score: calculateRelatedProductScore(currentProduct.toObject ? currentProduct.toObject() : currentProduct, product)
        }))
        .filter(item => item.score > 0)
        .sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return new Date(b.product.createdAt || 0) - new Date(a.product.createdAt || 0);
        });

    const prioritizedProducts = scoredProducts.length
        ? scoredProducts.map(item => item.product)
        : allProducts;

    const uniqueProducts = [];
    const seenIds = new Set();

    for (const product of prioritizedProducts) {
        const productId = Number(product.productId);
        if (!Number.isInteger(productId) || productId <= 0 || seenIds.has(productId)) continue;
        seenIds.add(productId);
        uniqueProducts.push(product);
        if (uniqueProducts.length >= 4) break;
    }

    return uniqueProducts.map(product => serializeProduct(product));
};

const serializeProduct = (product) => {
    const data = product.toObject ? product.toObject() : product;
    return {
        ...data,
        relatedProducts: Array.isArray(data.relatedProducts)
            ? data.relatedProducts
            : [],
        relatedProductsMessage: "Explore more gifts from Shailu's Concepts"
    };
};


// =====================================================
// GET ALL PRODUCTS
// =====================================================

const getProducts = async (req, res) => {

    try {

        const products =
            await Product
                .find()
                .sort({ productId: 1 });


        res.status(200).json(products.map(serializeProduct));

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


        res.status(200).json(serializeProduct(product));

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

const getProductRelated = async (req, res) => {
    try {
        const productId = Number(req.params.productId);

        if (!Number.isInteger(productId) || productId <= 0) {
            return res.status(400).json({
                message: "Product ID must be a valid number"
            });
        }

        const relatedProducts = await getAutomaticRelatedProducts(productId);

        return res.status(200).json({
            products: relatedProducts,
            message: "Explore more gifts from Shailu's Concepts"
        });
    } catch (error) {
        console.error("Get related products error:", error);
        return res.status(500).json({
            message: "Failed to fetch related products"
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
            description,
            relatedProducts
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

        const validRelatedProducts =
            await getValidRelatedProductIds(
                relatedProducts,
                numericProductId
            );


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

                relatedProducts:
                    validRelatedProducts,


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

        if (req.body.relatedProducts !== undefined) {
            product.relatedProducts =
                await getValidRelatedProductIds(
                    req.body.relatedProducts,
                    productId
                );
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

        const rawProductId = req.params.productId;
        const productId = Number(rawProductId);

        if (
            rawProductId === undefined ||
            rawProductId === null ||
            rawProductId === ""
        ) {

            return res.status(400).json({
                message: "Invalid product ID."
            });

        }

        let product = null;

        if (Number.isInteger(productId)) {
            product = await Product.findOneAndDelete({
                productId: productId
            });
        }

        if (!product && rawProductId.length === 24) {
            product = await Product.findOneAndDelete({
                _id: rawProductId
            });
        }

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

    getProductRelated,

    createProduct,

    updateProduct,

    deleteProduct

};