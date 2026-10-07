const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables FIRST
dotenv.config({ path: path.join(__dirname, ".env") });

if (process.env.NODE_ENV === "production") {
    const requiredProductionVariables = [
        "MONGO_URI",
        "JWT_SECRET",
        "ADMIN_EMAIL",
        "ADMIN_PASSWORD",
        "FRONTEND_URL",
        "UPLOADS_DIR",
        "RAZORPAY_KEY_ID",
        "RAZORPAY_KEY_SECRET",
        "RAZORPAY_WEBHOOK_SECRET"
    ];
    const missingProductionVariables = requiredProductionVariables.filter(
        (name) => !process.env[name]
    );

    if (missingProductionVariables.length) {
        throw new Error(
            `Missing required production environment variables: ${missingProductionVariables.join(", ")}`
        );
    }

    if (process.env.JWT_SECRET.length < 32) {
        throw new Error("JWT_SECRET must be at least 32 characters in production");
    }

    if (!path.isAbsolute(process.env.UPLOADS_DIR)) {
        throw new Error("UPLOADS_DIR must be an absolute persistent storage path");
    }

    if (!process.env.RAZORPAY_KEY_ID.startsWith("rzp_live_")) {
        throw new Error("Production requires a Razorpay live key ID");
    }

    const productionFrontendOrigins = process.env.FRONTEND_URL
        .split(",")
        .map((origin) => origin.trim().replace(/\/+$/, ""))
        .filter(Boolean);
    const hasInvalidFrontendOrigin = productionFrontendOrigins.some((origin) => {
        try {
            const parsedOrigin = new URL(origin);
            return parsedOrigin.protocol !== "https:" ||
                parsedOrigin.origin !== origin;
        } catch {
            return true;
        }
    });

    if (hasInvalidFrontendOrigin) {
        throw new Error("FRONTEND_URL must contain only valid HTTPS origins");
    }
}

const uploadMiddleware = require("./middleware/uploadMiddleware");
const connectDB = require("./config/db");

// Routes
const productRoutes = require("./routes/productRoutes");
const authRoutes = require("./routes/authRoutes");
const heroRoutes = require("./routes/heroRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const orderRoutes = require("./routes/orderRoutes");

const scrollCategoryRoutes =
    require("./routes/scrollCategoryRoutes");

const bestSellerRoutes =
    require("./routes/bestSellerRoutes");

const standoutRoutes =
    require("./routes/standoutRoutes");

// Create Express application
const app = express();

// Frontend root
const giftcardRoot = path.join(
    __dirname,
    "../giftcard"
);
const uploadRoots = [
    uploadMiddleware.uploadRoot,
    uploadMiddleware.legacyUploadRoot
].filter((root, index, roots) =>
    roots.indexOf(root) === index
);

// Middleware
const configuredOrigins = (process.env.FRONTEND_URL || "")
    .split(",")
    .map((origin) => origin.trim().replace(/\/+$/, ""))
    .filter(Boolean);

const isLocalDevelopment = process.env.NODE_ENV !== "production";

app.disable("x-powered-by");
app.use(cors({
    origin(origin, callback) {
        if (!origin) {
            return callback(null, true);
        }

        const normalizedOrigin = origin.replace(/\/+$/, "");
        const localOrigin =
            isLocalDevelopment &&
            /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(normalizedOrigin);

        callback(
            null,
            localOrigin || configuredOrigins.includes(normalizedOrigin)
        );
    }
}));
app.use(express.json({
    limit: "1mb",
    verify(req, res, buffer) {
        if (req.originalUrl.split("?")[0] === "/api/payment/webhook") {
            req.rawBody = buffer;
        }
    }
}));

// Serve current uploads first, then the legacy directory during migration.
for (const uploadRoot of uploadRoots) {
    app.use("/uploads", express.static(uploadRoot));
}

// Serve frontend files
app.use(
    express.static(giftcardRoot)
);

// Category route
app.get("/category", (req, res) => {
    res.redirect("/index.html");
});

// Dynamic category pages
app.get("/category/:slug", (req, res) => {
    res.sendFile(
        path.join(
            giftcardRoot,
            "category.html"
        )
    );
});

// Home / API status
app.get("/", (req, res) => {
    res.json({
        message: "Giftcard Backend API is running"
    });
});


// ==============================
// API ROUTES
// ==============================

// Hero
app.use(
    "/api/hero",
    heroRoutes
);

// Products
app.use(
    "/api/products",
    productRoutes
);

// Authentication
app.use(
    "/api/auth",
    authRoutes
);

// Razorpay Payments
app.use(
    "/api/payment",
    paymentRoutes
);

// Orders
app.use(
    "/api/orders",
    orderRoutes
);

// Scroll Categories
app.use(
    "/api/scroll-categories",
    scrollCategoryRoutes
);

// Best Sellers
app.use(
    "/api/best-sellers",
    bestSellerRoutes
);

// Standout
app.use(
    "/api/standout",
    standoutRoutes
);


// ==============================
// START SERVER
// ==============================

const PORT = process.env.PORT || 5000;

const startServer = async (databaseConnector = connectDB) => {
    await databaseConnector();
    return app.listen(PORT, "0.0.0.0", () => {
        console.log(`Server listening on port ${PORT}`);
    });
};

if (require.main === module) {
    startServer().catch((error) => {
        console.error("Server startup failed:", error.message);
        process.exit(1);
    });
}

app.startServer = startServer;
module.exports = app;