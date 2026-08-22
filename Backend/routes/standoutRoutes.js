const express = require("express");
const multer = require("multer");
const path = require("path");

const {
    getStandout,
    createStandout,
    updateStandout,
    deleteStandout
} = require("../controllers/standoutController");

const router = express.Router();

const storage = multer.diskStorage({

    destination: function(req, file, cb) {
        cb(
            null,
            path.join(
                __dirname,
                "../uploads/standout"
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

router.get("/", getStandout);

router.post(
    "/",
    upload.single("image"),
    createStandout
);

router.put(
    "/:id",
    upload.single("image"),
    updateStandout
);

router.delete(
    "/:id",
    deleteStandout
);

module.exports = router;