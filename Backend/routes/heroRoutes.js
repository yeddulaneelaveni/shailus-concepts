const express = require("express");

const router = express.Router();

const {
    getHeroes,
    getHeroById,
    createHero,
    updateHero,
    deleteHero
} = require("../controllers/heroController");

const adminMiddleware =
    require("../middleware/adminMiddleware");

const upload =
    require("../middleware/uploadMiddleware");


// ==========================================
// PUBLIC
// ==========================================

router.get(
    "/",
    getHeroes
);


router.get(
    "/:id",
    getHeroById
);


// ==========================================
// ADMIN
// ==========================================

router.post(
    "/",
    adminMiddleware,
    upload.single("heroImage"),
    createHero
);


router.put(
    "/:id",
    adminMiddleware,
    upload.single("heroImage"),
    updateHero
);


router.delete(
    "/:id",
    adminMiddleware,
    deleteHero
);


module.exports = router;