const multer = require("multer");
const path = require("path");
const fs = require("fs");


// =====================================================
// CREATE UPLOAD DIRECTORIES
// =====================================================

const productUploadDir = path.join(
    __dirname,
    "..",
    "uploads",
    "products"
);

const heroUploadDir = path.join(
    __dirname,
    "..",
    "uploads",
    "heroes"
);


if (!fs.existsSync(productUploadDir)) {
    fs.mkdirSync(productUploadDir, {
        recursive: true
    });
}


if (!fs.existsSync(heroUploadDir)) {
    fs.mkdirSync(heroUploadDir, {
        recursive: true
    });
}


// =====================================================
// FILE STORAGE
// =====================================================

const storage = multer.diskStorage({

    destination: (req, file, cb) => {

    const isHeroUpload =
        req.params.type === "hero" ||
        req.body.uploadType === "hero" ||
        req.originalUrl.includes("/api/hero");

    if (isHeroUpload) {

        cb(null, heroUploadDir);

    } else {

        cb(null, productUploadDir);

    }
},

    filename: (req, file, cb) => {

        const extension =
            path.extname(file.originalname);

        const fileName =
            `${Date.now()}-${Math.round(Math.random() * 1E9)}${extension}`;

        cb(null, fileName);
    }

});


// =====================================================
// FILE FILTER
// =====================================================

const fileFilter = (req, file, cb) => {

    const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "image/gif"
    ];


    if (allowedTypes.includes(file.mimetype)) {

        cb(null, true);

    } else {

        cb(
            new Error(
                "Only JPG, JPEG, PNG, WEBP and GIF images are allowed"
            ),
            false
        );

    }
};


// =====================================================
// MULTER CONFIGURATION
// =====================================================

const upload = multer({

    storage: storage,

    fileFilter: fileFilter,

    limits: {
        fileSize: 5 * 1024 * 1024
    }

});


module.exports = upload;