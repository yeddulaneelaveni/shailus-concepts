(function () {
  const CATEGORY_DEFINITIONS = [
    {
      title: "German Silver",
      slug: "german-silver",
      description: "Discover elegant German silver gifts and traditional decorative pieces."
    },
    {
      title: "Kids Gifts",
      slug: "kids-gifts",
      description: "Fun, creative and memorable gifts for children."
    },
    {
      title: "Brass Gifts",
      slug: "brass-gifts",
      description: "Thoughtful and unique gifts curated for brass."
    },
    {
      title: "Crockery Gifts",
      slug: "crockery-gifts",
      description: "Beautiful crockery and serving pieces perfect for gifting and celebrations."
    },
    {
      title: "Water Bottles",
      slug: "water-bottles",
      description: "Stylish and practical bottles suitable for everyday use and gifting."
    },
    {
      title: "Home Decor",
      slug: "home-decor",
      description: "Traditional and contemporary decorative pieces for beautiful homes."
    },
    {
      title: "Pichwai Gifts",
      slug: "pichwai-gifts",
      description: "Art-inspired Pichwai decorative gifts with a traditional Indian aesthetic."
    },
    {
      title: "Corporate Gifts",
      slug: "corporate-gifts",
      description: "Professional and thoughtful gifting options for corporate occasions."
    },
    {
      title: "Meenakari Gifts",
      slug: "meenakari-gifts",
      description: "Colorful handcrafted Meenakari-inspired gifts and decorative pieces."
    },
    {
      title: "Wooden Trays & Boxes",
      slug: "wooden-trays-boxes",
      description: "Elegant wooden trays and boxes designed for gifting, serving and home décor."
    },
    {
      title: "Kondapalli Bommallu",
      slug: "kondapalli-bommallu",
      description: "Explore handcrafted Kondapalli Bommallu inspired by the traditional wooden craft of Andhra Pradesh."
    },
    {
      title: "Combos",
      slug: "combos",
      description: "Curated gift combinations designed for memorable celebrations."
    },
    {
      title: "New Collection",
      slug: "new-collection",
      description: "Explore the latest additions to the Shailu's Concepts gift collection."
    },
    {
      title: "Jute Bags",
      slug: "jute-bags",
      description: "Eco-friendly and stylish jute bags suitable for gifting and everyday use."
    },
    {
      title: "Traditional Gifts",
      slug: "traditional-gifts",
      description: "Traditional Indian gifts celebrating craftsmanship, culture and heritage."
    }
  ];

  const slugifyCategory = function (value) {
    return String(value || "")
      .toLowerCase()
      .replace(/&/g, " ")
      .replace(/[^a-z0-9\s-]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/\s+/g, "-");
  };

  const normalizeCategoryValue = function (value) {
    return String(value || "")
      .toLowerCase()
      .replace(/&/g, " ")
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  };

  const simplifyComparisonValue = function (value) {
    return normalizeCategoryValue(value)
      .replace(/(.)\1+/g, "$1")
      .replace(/\s+/g, " ")
      .trim();
  };

  const getCategoryBySlug = function (slug) {
    const target = normalizeCategoryValue(slug || "");

    return CATEGORY_DEFINITIONS.find(function (category) {
      const matchSlug = normalizeCategoryValue(category.slug);
      const matchTitle = normalizeCategoryValue(category.title);
      return matchSlug === target || matchTitle === target || slugifyCategory(category.title) === target;
    }) || null;
  };

  const buildCategoryUrl = function (slug) {
    const safeSlug = String(slug || "").trim();
    const backendOrigin = window.API_BASE_URL || window.location.origin;
    return `${backendOrigin.replace(/\/$/, "")}/category/${encodeURIComponent(safeSlug)}`;
  };

  const matchesProductCategory = function (productCategory, categoryLabel) {
    const category = typeof categoryLabel === "string" ? { title: categoryLabel } : categoryLabel;
    const productValue = normalizeCategoryValue(productCategory);
    const categoryValue = normalizeCategoryValue(category && category.title ? category.title : "");
    const categorySlug = normalizeCategoryValue(category && category.slug ? category.slug : slugifyCategory(category.title || ""));

    if (!productValue || !categoryValue) {
      return false;
    }

    const values = [
      productValue,
      productValue.replace(/s$/, ""),
      productValue.replace(/\s+gift(s)?$/i, ""),
      productValue.replace(/\s+return\s+gifts?$/i, "")
    ].map(simplifyComparisonValue);

    const categoryValues = [
      categoryValue,
      categorySlug,
      categorySlug.replace(/s$/, ""),
      categoryValue.replace(/s$/, ""),
      categoryValue.replace(/\s+gift(s)?$/i, "")
    ].map(simplifyComparisonValue);

    return values.some(function (value) {
      return categoryValues.some(function (candidate) {
        return value === candidate || value.includes(candidate) || candidate.includes(value);
      });
    });
  };

  window.ShailuCategoryConfig = {
    CATEGORY_DEFINITIONS,
    slugifyCategory,
    normalizeCategoryValue,
    getCategoryBySlug,
    buildCategoryUrl,
    matchesProductCategory
  };
})();
