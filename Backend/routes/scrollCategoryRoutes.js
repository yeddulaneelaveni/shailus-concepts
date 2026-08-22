const express = require("express");
const multer = require("multer");
const path = require("path");

const {
    getScrollCategories,
    createScrollCategory,
    updateScrollCategory,
    deleteScrollCategory
} = require("../controllers/scrollCategoryController");

const router = express.Router();

const storage = multer.diskStorage({

    destination: function(req, file, cb) {
        cb(
            null,
            path.join(
                __dirname,
                "../uploads/scroll"
            )
        );
    },

    filename: function(req, file, cb) {

        const uniqueName =
            Date.now() +
            "-" +
            file.originalname
                .replace(/\s+/g, "-");

        cb(null, uniqueName);
    }
});

const upload = multer({
    storage: storage
});

router.get("/", getScrollCategories);

router.post(
    "/",
    upload.single("image"),
    createScrollCategory
);

router.put(
    "/:id",
    upload.single("image"),
    updateScrollCategory
);

router.delete(
    "/:id",
    deleteScrollCategory
);

module.exports = router;