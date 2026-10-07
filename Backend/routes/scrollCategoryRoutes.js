const express = require("express");
const adminMiddleware = require("../middleware/adminMiddleware");
const imageUpload = require("../middleware/uploadMiddleware");

const {
    getScrollCategories,
    createScrollCategory,
    updateScrollCategory,
    deleteScrollCategory
} = require("../controllers/scrollCategoryController");

const router = express.Router();

const multer = require("multer");
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, imageUpload.getUploadDirectory("scroll"));
    },

    filename: function(req, file, cb) {
        cb(null, imageUpload.createUploadFilename(file.originalname));
    }
});

const upload = imageUpload.createImageUpload(storage);

router.get("/", getScrollCategories);

router.post(
    "/",
    adminMiddleware,
    upload.single("image"),
    createScrollCategory
);

router.put(
    "/:id",
    adminMiddleware,
    upload.single("image"),
    updateScrollCategory
);

router.delete(
    "/:id",
    adminMiddleware,
    deleteScrollCategory
);

module.exports = router;