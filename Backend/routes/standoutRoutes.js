const express = require("express");
const adminMiddleware = require("../middleware/adminMiddleware");
const imageUpload = require("../middleware/uploadMiddleware");

const {
    getStandout,
    createStandout,
    updateStandout,
    deleteStandout
} = require("../controllers/standoutController");

const router = express.Router();

const multer = require("multer");
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, imageUpload.getUploadDirectory("standout"));
    },

    filename: function(req, file, cb) {
        cb(null, imageUpload.createUploadFilename(file.originalname));
    }
});

const upload = imageUpload.createImageUpload(storage);

router.get("/", getStandout);

router.post(
    "/",
    adminMiddleware,
    upload.single("image"),
    createStandout
);

router.put(
    "/:id",
    adminMiddleware,
    upload.single("image"),
    updateStandout
);

router.delete(
    "/:id",
    adminMiddleware,
    deleteStandout
);

module.exports = router;