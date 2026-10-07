const express = require("express");
const adminMiddleware = require("../middleware/adminMiddleware");
const imageUpload = require("../middleware/uploadMiddleware");

const {
    getBestSellers,
    createBestSeller,
    updateBestSeller,
    deleteBestSeller
} = require("../controllers/bestSellerController");

const router = express.Router();

const multer = require("multer");
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, imageUpload.getUploadDirectory("best-sellers"));
    },

    filename: function(req, file, cb) {
        cb(null, imageUpload.createUploadFilename(file.originalname));
    }
});

const upload = imageUpload.createImageUpload(storage);

router.get("/", getBestSellers);

router.post(
    "/",
    adminMiddleware,
    upload.single("image"),
    createBestSeller
);

router.put(
    "/:id",
    adminMiddleware,
    upload.single("image"),
    updateBestSeller
);

router.delete(
    "/:id",
    adminMiddleware,
    deleteBestSeller
);

module.exports = router;