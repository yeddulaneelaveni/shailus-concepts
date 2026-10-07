const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");


// =====================================================
// CREATE UPLOAD DIRECTORIES
// =====================================================

const legacyUploadRoot = path.resolve(__dirname, "..", "Uploads");
const configuredUploadPath = process.env.UPLOADS_DIR;
const uploadRoot = configuredUploadPath
    ? path.isAbsolute(configuredUploadPath)
        ? path.resolve(configuredUploadPath)
        : path.resolve(__dirname, "..", configuredUploadPath)
    : legacyUploadRoot;

const getUploadDirectory = (...segments) => {
    const directory = path.resolve(uploadRoot, ...segments);

    if (
        directory !== uploadRoot &&
        !directory.startsWith(`${uploadRoot}${path.sep}`)
    ) {
        throw new Error("Upload directory must remain inside UPLOADS_DIR");
    }

    return directory;
};

const uploadSubdirectories = [
    "products",
    "heroes",
    "best-sellers",
    "scroll",
    "standout"
];

for (const subdirectory of uploadSubdirectories) {
    fs.mkdirSync(getUploadDirectory(subdirectory), { recursive: true });
}

const createUploadFilename = (originalName) => {
    const extension = path.extname(String(originalName || "")).toLowerCase();
    return `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${extension}`;
};


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
        cb(null, getUploadDirectory("heroes"));
    } else {
        cb(null, getUploadDirectory("products"));
    }
},

    filename: (req, file, cb) => {
        cb(null, createUploadFilename(file.originalname));
    }

});


// =====================================================
// FILE FILTER
// =====================================================

const fileFilter = (req, file, cb) => {

    const allowedTypesByExtension = {
        ".jpg": ["image/jpeg", "image/jpg"],
        ".jpeg": ["image/jpeg", "image/jpg"],
        ".png": ["image/png"],
        ".webp": ["image/webp"],
        ".gif": ["image/gif"]
    };
    const extension = path.extname(file.originalname).toLowerCase();
    const allowedMimeTypes = allowedTypesByExtension[extension] || [];

    if (allowedMimeTypes.includes(file.mimetype)) {

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

const createImageUpload = (imageStorage) => multer({
    storage: imageStorage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

const upload = createImageUpload(storage);
upload.createImageUpload = createImageUpload;
upload.createUploadFilename = createUploadFilename;
upload.getUploadDirectory = getUploadDirectory;
upload.uploadRoot = uploadRoot;
upload.legacyUploadRoot = legacyUploadRoot;


module.exports = upload;