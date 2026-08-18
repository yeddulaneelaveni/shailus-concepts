const mongoose = require("mongoose");
const dotenv = require("dotenv");

const Product = require("./models/Product");
const products = require("./data/products");

dotenv.config();

const seedProducts = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB connected");

        // Remove old products
        await Product.deleteMany({});

        console.log("Old products removed");

        // Convert frontend data into MongoDB format
        const formattedProducts = products.map((product) => ({
            productId: product.id,
            name: product.name,
            category: product.category,
            images: product.images || [],
            image: product.image || "",
            price: Number(String(product.price).replace(/[₹,]/g, "")),
            badge: product.badge || "",
            rating: product.rating || 0,
            newArrival: product.newArrival || false,
            bestSeller: product.bestSeller || false,
            description: product.description || ""
        }));

        // Insert all products
        await Product.insertMany(formattedProducts);

        console.log(
            `${formattedProducts.length} products inserted successfully`
        );

        await mongoose.connection.close();

        console.log("MongoDB connection closed");

        process.exit(0);

    } catch (error) {
        console.error("Error seeding products:", error);

        try {
            await mongoose.connection.close();
        } catch (closeError) {
            console.error("Error closing MongoDB:", closeError.message);
        }

        process.exit(1);
    }
};

seedProducts();