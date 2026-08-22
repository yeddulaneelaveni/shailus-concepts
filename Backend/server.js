const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./config/db");
const productRoutes = require("./routes/productRoutes");
const authRoutes = require("./routes/authRoutes");
const heroRoutes = require("./routes/heroRoutes");

const scrollCategoryRoutes =
    require("./routes/scrollCategoryRoutes");

const bestSellerRoutes =
    require("./routes/bestSellerRoutes");

const standoutRoutes =
    require("./routes/standoutRoutes");


dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Home route
app.get("/", (req, res) => {
    res.json({
        message: "Giftcard Backend API is running"
    });
});

app.use(
    "/uploads",
    express.static(
        path.join(__dirname, "uploads")
    )
);

app.use(
    "/api/hero",
    heroRoutes
);

// Product routes
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);

app.use(
    "/api/scroll-categories",
    scrollCategoryRoutes
);

app.use(
    "/api/best-sellers",
    bestSellerRoutes
);

app.use(
    "/api/standout",
    standoutRoutes
);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});