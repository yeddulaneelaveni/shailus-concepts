const Hero = require("../models/Hero");


// GET ALL HEROES
const getHeroes = async (req, res) => {

    try {

        const heroes = await Hero.find()
            .sort({ order: 1 });

        res.status(200).json(heroes);

    } catch (error) {

        console.error("Get heroes error:", error);

        res.status(500).json({
            message: "Failed to fetch hero slides"
        });
    }
};


// GET SINGLE HERO
const getHeroById = async (req, res) => {

    try {

        const hero = await Hero.findById(
            req.params.id
        );

        if (!hero) {

            return res.status(404).json({
                message: "Hero not found"
            });
        }

        res.status(200).json(hero);

    } catch (error) {

        console.error("Get hero error:", error);

        res.status(500).json({
            message: "Failed to fetch hero"
        });
    }
};


// CREATE HERO
const createHero = async (req, res) => {

    try {

        const {
            title,
            subtitle,
            description,
            buttonText,
            buttonLink,
            active,
            order
        } = req.body;


        if (!title) {

            return res.status(400).json({
                message: "Hero title is required"
            });
        }


        if (
            !req.file
        ) {

            return res.status(400).json({
                message: "Hero image is required"
            });
        }


        const hero = await Hero.create({

            title,

            subtitle:
                subtitle || "",

            description:
                description || "",

            image:
                `/uploads/heroes/${req.file.filename}`,

            buttonText:
                buttonText || "Shop Now",

            buttonLink:
                buttonLink ||
                "index.html#gallery",

            active:
                active === "true",

            order:
                Number(order) || 1

        });


        res.status(201).json({

            message:
                "Hero created successfully",

            hero

        });

    } catch (error) {

        console.error(
            "Create hero error:",
            error
        );

        res.status(500).json({

            message:
                "Failed to create hero"

        });
    }
};


// UPDATE HERO
const updateHero = async (req, res) => {

    try {

        const hero =
            await Hero.findById(
                req.params.id
            );


        if (!hero) {

            return res.status(404).json({
                message: "Hero not found"
            });
        }


        const {
            title,
            subtitle,
            description,
            buttonText,
            buttonLink,
            active,
            order
        } = req.body;


        if (title !== undefined)
            hero.title = title;


        if (subtitle !== undefined)
            hero.subtitle = subtitle;


        if (description !== undefined)
            hero.description =
                description;


        if (buttonText !== undefined)
            hero.buttonText =
                buttonText;


        if (buttonLink !== undefined)
            hero.buttonLink =
                buttonLink;


        if (active !== undefined)
            hero.active =
                active === "true";


        if (order !== undefined)
            hero.order =
                Number(order);


        // Replace image only if
        // admin selects a new image

        if (req.file) {

            hero.image =
                `/uploads/heroes/${req.file.filename}`;

        }


        await hero.save();


        res.status(200).json({

            message:
                "Hero updated successfully",

            hero

        });

    } catch (error) {

        console.error(
            "Update hero error:",
            error
        );

        res.status(500).json({

            message:
                "Failed to update hero"

        });
    }
};


// DELETE HERO
const deleteHero = async (req, res) => {

    try {

        const hero =
            await Hero.findByIdAndDelete(
                req.params.id
            );


        if (!hero) {

            return res.status(404).json({
                message: "Hero not found"
            });
        }


        res.status(200).json({

            message:
                "Hero deleted successfully"

        });

    } catch (error) {

        console.error(
            "Delete hero error:",
            error
        );

        res.status(500).json({

            message:
                "Failed to delete hero"

        });
    }
};


module.exports = {

    getHeroes,

    getHeroById,

    createHero,

    updateHero,

    deleteHero

};