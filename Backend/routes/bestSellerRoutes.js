const express = require("express");
const multer = require("multer");
const path = require("path");

const {
    getBestSellers,
    createBestSeller,
    updateBestSeller,
    deleteBestSeller
} = require("../controllers/bestSellerController");

const router = express.Router();

const storage = multer.diskStorage({

    destination: function(req, file, cb) {
        cb(
            null,
            path.join(
                __dirname,
                "../uploads/best-sellers"
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

router.get("/", getBestSellers);

router.post(
    "/",
    upload.single("image"),
    createBestSeller
);

router.put(
    "/:id",
    upload.single("image"),
    updateBestSeller
);

router.delete(
    "/:id",
    deleteBestSeller
);

module.exports = router;