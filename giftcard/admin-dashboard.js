// =====================================================
// ADMIN DASHBOARD JAVASCRIPT
// =====================================================

// =====================================================
// CONFIGURATION
// =====================================================

const API_URL = "http://localhost:5000";

const adminToken =
    localStorage.getItem("adminToken") ||
    localStorage.getItem("token") ||
    "";


// =====================================================
// SECTION NAVIGATION
// =====================================================

function showSection(sectionId, button) {

    console.log("Opening section:", sectionId);

    const section = document.getElementById(sectionId);

    if (!section) {
        console.error("Section not found:", sectionId);
        return;
    }

    document
        .querySelectorAll(".dashboard-section")
        .forEach(section => {
            section.classList.remove("active-section");
        });

    section.classList.add("active-section");

    document
        .querySelectorAll(".sidebar-btn")
        .forEach(btn => {
            btn.classList.remove("active");
        });

    if (button) {
        button.classList.add("active");
    }
}


function showSectionById(sectionId) {

    const section = document.getElementById(sectionId);

    if (!section) {
        console.error("Section not found:", sectionId);
        return;
    }

    document
        .querySelectorAll(".dashboard-section")
        .forEach(section => {
            section.classList.remove("active-section");
        });

    section.classList.add("active-section");

    document
        .querySelectorAll(".sidebar-btn")
        .forEach(btn => {
            btn.classList.remove("active");
        });
}


// =====================================================
// HELPER FUNCTIONS
// =====================================================

function getImageUrl(image) {

    if (!image) {
        return "";
    }

    if (
        image.startsWith("http://") ||
        image.startsWith("https://")
    ) {
        return image;
    }

    if (image.startsWith("/")) {
        return `${API_URL}${image}`;
    }

    return image;
}


function escapeHTML(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function authHeaders() {

    return {
        "Authorization": `Bearer ${adminToken}`
    };
}


// =====================================================
// DASHBOARD
// =====================================================

async function loadDashboardStats() {

    try {

        const response =
            await fetch(`${API_URL}/api/products`);

        const products =
            await response.json();

        if (!response.ok) {
            throw new Error("Failed to load products");
        }

        const totalProducts =
            document.getElementById("totalProducts");

        const newArrivals =
            document.getElementById("newArrivals");

        const bestSellers =
            document.getElementById("bestSellers");

        if (totalProducts) {
            totalProducts.textContent =
                products.length;
        }

        if (newArrivals) {

            newArrivals.textContent =
                products.filter(
                    product => product.newArrival === true
                ).length;
        }

        if (bestSellers) {

            bestSellers.textContent =
                products.filter(
                    product => product.bestSeller === true
                ).length;
        }

    } catch (error) {

        console.error(
            "Dashboard statistics error:",
            error
        );
    }


    try {

        const response =
            await fetch(`${API_URL}/api/heroes`);

        const heroes =
            await response.json();

        if (!response.ok) {
            throw new Error("Failed to load heroes");
        }

        const totalHeroes =
            document.getElementById("totalHeroes");

        if (totalHeroes) {
            totalHeroes.textContent =
                heroes.length;
        }

    } catch (error) {

        console.error(
            "Hero statistics error:",
            error
        );
    }
}


// =====================================================
// PRODUCTS
// =====================================================

let allProducts = [];


// -----------------------------------------------------
// LOAD PRODUCTS
// -----------------------------------------------------

async function loadProducts() {

    const container =
        document.getElementById("productsContainer");

    if (!container) {
        return;
    }

    container.innerHTML =
        "Loading products...";

    try {

        const response =
            await fetch(
                `${API_URL}/api/products`
            );

        const products =
            await response.json();

        if (!response.ok) {

            throw new Error(
                products.message ||
                "Failed to load products"
            );
        }

        allProducts = products;

        renderProducts(products);

        loadDashboardStats();

    } catch (error) {

        console.error(
            "Product loading error:",
            error
        );

        container.innerHTML =
            `<p>Failed to load products.</p>`;
    }
}


// -----------------------------------------------------
// RENDER PRODUCTS
// -----------------------------------------------------

function renderProducts(products) {

    const container =
        document.getElementById(
            "productsContainer"
        );

    if (!container) {
        return;
    }

    if (!products.length) {

        container.innerHTML =
            "<p>No products found.</p>";

        return;
    }

    container.innerHTML =
        products.map(product => {

            const mainImage =
                product.image ||
                (
                    product.images &&
                    product.images.length
                        ? product.images[0]
                        : ""
                );

            const image =
                getImageUrl(mainImage);

            return `

                <div class="product-card">

                    ${
                        image
                            ? `
                                <img
                                    src="${image}"
                                    alt="${escapeHTML(
                                        product.name
                                    )}"
                                >
                            `
                            :
                            `
                                <div style="
                                    height:190px;
                                    display:flex;
                                    align-items:center;
                                    justify-content:center;
                                    background:#eee;
                                ">
                                    No Image
                                </div>
                            `
                    }

                    <div class="product-info">

                        <h3>
                            ${escapeHTML(
                                product.name
                            )}
                        </h3>

                        <p>
                            ID:
                            ${product.productId}
                        </p>

                        <p>
                            Category:
                            ${escapeHTML(
                                product.category
                            )}
                        </p>

                        <p>
                            Price:
                            ₹${Number(
                                product.price || 0
                            ).toFixed(2)}
                        </p>

                        <p>
                            Rating:
                            ${product.rating || 0}
                        </p>

                        ${
                            product.badge
                                ? `
                                    <p>
                                        Badge:
                                        ${escapeHTML(
                                            product.badge
                                        )}
                                    </p>
                                `
                                : ""
                        }

                        <div>

                            ${
                                product.newArrival
                                    ? `
                                        <span class="status-active">
                                            New Arrival
                                        </span>
                                    `
                                    : ""
                            }

                            ${
                                product.bestSeller
                                    ? `
                                        <span class="status-active">
                                            Best Seller
                                        </span>
                                    `
                                    : ""
                            }

                        </div>

                        <div class="product-actions">

                            <button
                                class="edit-btn"
                                onclick="editProduct('${product._id}')"
                            >
                                Edit
                            </button>

                            <button
                                class="delete-btn"
                                onclick="deleteProduct('${product._id}')"
                            >
                                Delete
                            </button>

                        </div>

                    </div>

                </div>

            `;

        }).join("");
}


// -----------------------------------------------------
// SEARCH PRODUCTS
// -----------------------------------------------------

function searchProducts() {

    const input =
        document.getElementById(
            "productSearch"
        );

    if (!input) {
        return;
    }

    const search =
        input.value
            .trim()
            .toLowerCase();

    if (!search) {

        renderProducts(
            allProducts
        );

        return;
    }

    const filtered =
        allProducts.filter(product => {

            return (

                String(
                    product.productId || ""
                )
                    .toLowerCase()
                    .includes(search)

                ||

                String(
                    product.name || ""
                )
                    .toLowerCase()
                    .includes(search)

                ||

                String(
                    product.category || ""
                )
                    .toLowerCase()
                    .includes(search)

            );

        });

    renderProducts(filtered);
}


// =====================================================
// PRODUCT FORM
// =====================================================

function prepareAddProduct() {

    resetProductForm();

    showSectionById(
        "addProductSection"
    );
}


function resetProductForm() {

    const form =
        document.getElementById(
            "productForm"
        );

    if (form) {
        form.reset();
    }

    const editingId =
        document.getElementById(
            "editingProductId"
        );

    if (editingId) {
        editingId.value = "";
    }

    const title =
        document.getElementById(
            "productFormTitle"
        );

    if (title) {
        title.textContent =
            "Add Product";
    }

    const message =
        document.getElementById(
            "productMessage"
        );

    if (message) {
        message.textContent = "";
    }

    const mainPreview =
        document.getElementById(
            "mainImagePreview"
        );

    if (mainPreview) {
        mainPreview.innerHTML = "";
    }

    const additionalPreview =
        document.getElementById(
            "additionalImagesPreview"
        );

    if (additionalPreview) {
        additionalPreview.innerHTML = "";
    }
}


// -----------------------------------------------------
// EDIT PRODUCT
// -----------------------------------------------------

async function editProduct(id) {

    const product =
        allProducts.find(
            item => item._id === id
        );

    if (!product) {

        alert(
            "Product not found."
        );

        return;
    }

    showSectionById(
        "addProductSection"
    );

    document.getElementById(
        "editingProductId"
    ).value = product._id;

    document.getElementById(
        "productId"
    ).value =
        product.productId || "";

    document.getElementById(
        "productName"
    ).value =
        product.name || "";

    document.getElementById(
        "productCategory"
    ).value =
        product.category || "";

    document.getElementById(
        "productPrice"
    ).value =
        product.price || 0;

    document.getElementById(
        "productDimensions"
    ).value =
        product.dimensions || "";

    document.getElementById(
        "productRating"
    ).value =
        product.rating || 0;

    document.getElementById(
        "productBadge"
    ).value =
        product.badge || "";

    document.getElementById(
        "productDescription"
    ).value =
        product.description || "";

    document.getElementById(
        "productNewArrival"
    ).checked =
        product.newArrival === true;

    document.getElementById(
        "productBestSeller"
    ).checked =
        product.bestSeller === true;

    document.getElementById(
        "productFormTitle"
    ).textContent =
        "Edit Product";

    const preview =
        document.getElementById(
            "mainImagePreview"
        );

    const image =
        product.image ||
        (
            product.images &&
            product.images.length
                ? product.images[0]
                : ""
        );

    if (image && preview) {

        preview.innerHTML = `
            <p>Current Image:</p>
            <img
                src="${getImageUrl(image)}"
                alt="${escapeHTML(
                    product.name
                )}"
            >
        `;
    }
}


// -----------------------------------------------------
// SAVE PRODUCT
// -----------------------------------------------------

async function saveProduct(event) {

    event.preventDefault();

    const editingId =
        document.getElementById(
            "editingProductId"
        ).value;

    const message =
        document.getElementById(
            "productMessage"
        );

    message.textContent =
        editingId
            ? "Updating product..."
            : "Adding product...";

    try {

        const formData =
            new FormData();

        formData.append(
            "productId",
            document.getElementById(
                "productId"
            ).value
        );

        formData.append(
            "name",
            document.getElementById(
                "productName"
            ).value.trim()
        );

        formData.append(
            "category",
            document.getElementById(
                "productCategory"
            ).value.trim()
        );

        formData.append(
            "price",
            document.getElementById(
                "productPrice"
            ).value
        );

        formData.append(
            "dimensions",
            document.getElementById(
                "productDimensions"
            ).value.trim()
        );

        formData.append(
            "rating",
            document.getElementById(
                "productRating"
            ).value
        );

        formData.append(
            "badge",
            document.getElementById(
                "productBadge"
            ).value.trim()
        );

        formData.append(
            "description",
            document.getElementById(
                "productDescription"
            ).value.trim()
        );

        formData.append(
            "newArrival",
            document.getElementById(
                "productNewArrival"
            ).checked
        );

        formData.append(
            "bestSeller",
            document.getElementById(
                "productBestSeller"
            ).checked
        );


        const mainImage =
            document.getElementById(
                "productImage"
            );

        if (
                mainImage.files &&
                mainImage.files.length
            ) {
                formData.append(
                    "mainImage",
                    mainImage.files[0]
                );
            }


        const additionalImages =
            document.getElementById(
                "productImages"
            );

        if (
                additionalImages.files &&
                additionalImages.files.length
            ) {

                for (
                    const file of additionalImages.files
                ) {

                    formData.append(
                        "additionalImages",
                        file
                    );
                }
            }


        const response =
            await fetch(

                editingId
                    ? `${API_URL}/api/products/${editingId}`
                    : `${API_URL}/api/products`,

                {
                    method:
                        editingId
                            ? "PUT"
                            : "POST",

                    headers:
                        authHeaders(),

                    body:
                        formData
                }

            );


        const data =
            await response.json();


        if (!response.ok) {

            message.style.color =
                "#b33";

            message.textContent =
                data.message ||
                "Product operation failed.";

            return;
        }


        message.style.color =
            "#0d3328";

        message.textContent =
            editingId
                ? "Product updated successfully!"
                : "Product added successfully!";


        await loadProducts();


        setTimeout(
            () => {

                resetProductForm();

                showSectionById(
                    "productsSection"
                );

            },
            700
        );


    } catch (error) {

        console.error(
            "Product save error:",
            error
        );

        message.style.color =
            "#b33";

        message.textContent =
            "Unable to connect to server.";
    }
}


// -----------------------------------------------------
// DELETE PRODUCT
// -----------------------------------------------------

async function deleteProduct(id) {

    if (
        !confirm(
            "Are you sure you want to delete this product?"
        )
    ) {
        return;
    }

    try {

        const response =
            await fetch(
                `${API_URL}/api/products/${id}`,
                {
                    method: "DELETE",
                    headers: authHeaders()
                }
            );

        const data =
            await response.json();

        if (!response.ok) {

            alert(
                data.message ||
                "Failed to delete product."
            );

            return;
        }

        alert(
            "Product deleted successfully."
        );

        await loadProducts();

    } catch (error) {

        console.error(error);

        alert(
            "Unable to connect to server."
        );
    }
}


// =====================================================
// HERO SECTION
// =====================================================

let allHeroes = [];


async function loadHeroes() {

    const container =
        document.getElementById(
            "heroesContainer"
        );

    if (!container) {
        return;
    }

    container.innerHTML =
        "Loading heroes...";

    try {

        const response =
            await fetch(
                `${API_URL}/api/heroes`
            );

        const heroes =
            await response.json();

        if (!response.ok) {

            throw new Error(
                heroes.message ||
                "Failed to load heroes"
            );
        }

        allHeroes = heroes;

        renderHeroes(heroes);

    } catch (error) {

        console.error(
            "Hero loading error:",
            error
        );

        container.innerHTML =
            "<p>Failed to load heroes.</p>";
    }
}


function renderHeroes(heroes) {

    const container =
        document.getElementById(
            "heroesContainer"
        );

    if (!container) {
        return;
    }

    if (!heroes.length) {

        container.innerHTML =
            "<p>No heroes found.</p>";

        return;
    }

    container.innerHTML =
        heroes.map(hero => {

            const image =
                getImageUrl(
                    hero.image
                );

            return `

                <div class="hero-card">

                    ${
                        image
                            ? `
                                <img
                                    src="${image}"
                                    alt="${escapeHTML(
                                        hero.title
                                    )}"
                                >
                            `
                            :
                            `
                                <div style="
                                    height:180px;
                                    display:flex;
                                    align-items:center;
                                    justify-content:center;
                                    background:#eee;
                                ">
                                    No Image
                                </div>
                            `
                    }

                    <div class="hero-card-content">

                        <h3>
                            ${escapeHTML(
                                hero.title
                            )}
                        </h3>

                        <p>
                            ${escapeHTML(
                                hero.subtitle || ""
                            )}
                        </p>

                        <p>
                            ${escapeHTML(
                                hero.description || ""
                            )}
                        </p>

                        <span class="hero-status">
                            ${
                                hero.active
                                    ? "Active"
                                    : "Inactive"
                            }
                        </span>

                        <div class="product-actions">

                            <button
                                class="edit-btn"
                                onclick="editHero('${hero._id}')"
                            >
                                Edit
                            </button>

                            <button
                                class="delete-btn"
                                onclick="deleteHero('${hero._id}')"
                            >
                                Delete
                            </button>

                        </div>

                    </div>

                </div>

            `;

        }).join("");
}


// -----------------------------------------------------
// ADD HERO
// -----------------------------------------------------

function prepareAddHero() {

    resetHeroForm();

    showSectionById(
        "heroSection"
    );
}


function resetHeroForm() {

    const form =
        document.getElementById(
            "heroForm"
        );

    if (form) {
        form.reset();
    }

    document.getElementById(
        "editingHeroId"
    ).value = "";

    document.getElementById(
        "heroActive"
    ).checked = true;

    document.getElementById(
        "heroOrder"
    ).value = 1;

    document.getElementById(
        "heroButtonText"
    ).value = "Shop Now";

    document.getElementById(
        "heroButtonLink"
    ).value =
        "index.html#gallery";

    document.getElementById(
        "heroImagePreview"
    ).innerHTML = "";

    document.getElementById(
        "heroMessage"
    ).textContent = "";
}


// -----------------------------------------------------
// EDIT HERO
// -----------------------------------------------------

function editHero(id) {

    const hero =
        allHeroes.find(
            item => item._id === id
        );

    if (!hero) {

        alert(
            "Hero not found."
        );

        return;
    }

    showSectionById(
        "heroSection"
    );

    document.getElementById(
        "editingHeroId"
    ).value =
        hero._id;

    document.getElementById(
        "heroTitle"
    ).value =
        hero.title || "";

    document.getElementById(
        "heroSubtitle"
    ).value =
        hero.subtitle || "";

    document.getElementById(
        "heroDescription"
    ).value =
        hero.description || "";

    document.getElementById(
        "heroButtonText"
    ).value =
        hero.buttonText || "Shop Now";

    document.getElementById(
        "heroButtonLink"
    ).value =
        hero.buttonLink ||
        "index.html#gallery";

    document.getElementById(
        "heroOrder"
    ).value =
        hero.order || 1;

    document.getElementById(
        "heroActive"
    ).checked =
        hero.active !== false;


    if (hero.image) {

        document.getElementById(
            "heroImagePreview"
        ).innerHTML = `

            <p>Current Image:</p>

            <img
                src="${getImageUrl(hero.image)}"
                alt="${escapeHTML(
                    hero.title
                )}"
            >

        `;
    }
}


// -----------------------------------------------------
// SAVE HERO
// -----------------------------------------------------

async function saveHero(event) {

    event.preventDefault();

    const editingId =
        document.getElementById(
            "editingHeroId"
        ).value;

    const message =
        document.getElementById(
            "heroMessage"
        );

    message.textContent =
        editingId
            ? "Updating hero..."
            : "Uploading hero...";


    try {

        const formData =
            new FormData();

        formData.append(
            "title",
            document.getElementById(
                "heroTitle"
            ).value.trim()
        );

        formData.append(
            "subtitle",
            document.getElementById(
                "heroSubtitle"
            ).value.trim()
        );

        formData.append(
            "description",
            document.getElementById(
                "heroDescription"
            ).value.trim()
        );

        formData.append(
            "buttonText",
            document.getElementById(
                "heroButtonText"
            ).value.trim()
        );

        formData.append(
            "buttonLink",
            document.getElementById(
                "heroButtonLink"
            ).value.trim()
        );

        formData.append(
            "order",
            document.getElementById(
                "heroOrder"
            ).value
        );

        formData.append(
            "active",
            document.getElementById(
                "heroActive"
            ).checked
        );


        const image =
            document.getElementById(
                "heroImage"
            );

        if (
            image.files &&
            image.files.length
        ) {

            formData.append(
                "image",
                image.files[0]
            );
        }


        const response =
            await fetch(

                editingId
                    ? `${API_URL}/api/heroes/${editingId}`
                    : `${API_URL}/api/heroes`,

                {
                    method:
                        editingId
                            ? "PUT"
                            : "POST",

                    headers:
                        authHeaders(),

                    body:
                        formData
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            message.style.color =
                "#b33";

            message.textContent =
                data.message ||
                "Hero operation failed.";

            return;
        }


        message.style.color =
            "#0d3328";

        message.textContent =
            editingId
                ? "Hero updated successfully!"
                : "Hero added successfully!";


        await loadHeroes();


        setTimeout(
            () => {

                resetHeroForm();

            },
            700
        );


    } catch (error) {

        console.error(
            "Hero save error:",
            error
        );

        message.style.color =
            "#b33";

        message.textContent =
            "Unable to connect to server.";
    }
}


// -----------------------------------------------------
// DELETE HERO
// -----------------------------------------------------

async function deleteHero(id) {

    if (
        !confirm(
            "Are you sure you want to delete this hero?"
        )
    ) {
        return;
    }

    try {

        const response =
            await fetch(
                `${API_URL}/api/heroes/${id}`,
                {
                    method: "DELETE",
                    headers: authHeaders()
                }
            );

        const data =
            await response.json();

        if (!response.ok) {

            alert(
                data.message ||
                "Failed to delete hero."
            );

            return;
        }

        alert(
            "Hero deleted successfully."
        );

        loadHeroes();

    } catch (error) {

        console.error(error);

        alert(
            "Unable to connect to server."
        );
    }
}


// =====================================================
// SCROLL CATEGORIES
// =====================================================

let allScrollCategories = [];


async function loadScrollCategories() {

    const container =
        document.getElementById(
            "scrollCategoriesContainer"
        );

    if (!container) {
        return;
    }

    container.innerHTML =
        "Loading scroll categories...";

    try {

        const response =
            await fetch(
                `${API_URL}/api/scroll-categories`
            );

        const categories =
            await response.json();

        if (!response.ok) {

            throw new Error(
                categories.message ||
                "Failed to load scroll categories"
            );
        }

        allScrollCategories =
            categories;


        if (!categories.length) {

            container.innerHTML =
                "<p>No scroll categories found.</p>";

            return;
        }


        container.innerHTML =
            categories.map(category => {

                const image =
                    getImageUrl(
                        category.image
                    );

                return `

                    <div class="hero-card">

                        ${
                            image
                                ? `
                                    <img
                                        src="${image}"
                                        alt="${escapeHTML(
                                            category.title
                                        )}"
                                    >
                                `
                                :
                                `
                                    <div style="
                                        height:180px;
                                        display:flex;
                                        align-items:center;
                                        justify-content:center;
                                        background:#eee;
                                    ">
                                        No Image
                                    </div>
                                `
                        }

                        <div class="hero-card-content">

                            <h3>
                                ${escapeHTML(
                                    category.title
                                )}
                            </h3>

                            <p>
                                Count:
                                ${category.count || 0}
                            </p>

                            <p>
                                Order:
                                ${category.order || 0}
                            </p>

                            <p>
                                Link:
                                ${escapeHTML(
                                    category.link || "#"
                                )}
                            </p>

                            <span class="hero-status">
                                ${
                                    category.active
                                        ? "Active"
                                        : "Inactive"
                                }
                            </span>

                            <div class="product-actions">

                                <button
                                    class="edit-btn"
                                    onclick="editScrollCategory('${category._id}')"
                                >
                                    Edit
                                </button>

                                <button
                                    class="delete-btn"
                                    onclick="deleteScrollCategory('${category._id}')"
                                >
                                    Delete
                                </button>

                            </div>

                        </div>

                    </div>

                `;

            }).join("");


    } catch (error) {

        console.error(
            "Scroll category loading error:",
            error
        );

        container.innerHTML =
            "<p>Failed to load scroll categories.</p>";
    }
}


function prepareAddScrollCategory() {

    resetScrollCategoryForm();

    showSectionById(
        "scrollCategorySection"
    );
}


function resetScrollCategoryForm() {

    const form =
        document.getElementById(
            "scrollCategoryForm"
        );

    if (form) {
        form.reset();
    }

    document.getElementById(
        "editingScrollCategoryId"
    ).value = "";

    document.getElementById(
        "scrollCategoryActive"
    ).checked = true;

    document.getElementById(
        "scrollCategoryOrder"
    ).value = 1;

    document.getElementById(
        "scrollCategoryCount"
    ).value = 0;

    document.getElementById(
        "scrollCategoryImagePreview"
    ).innerHTML = "";

    document.getElementById(
        "scrollCategoryMessage"
    ).textContent = "";
}


function editScrollCategory(id) {

    const category =
        allScrollCategories.find(
            item => item._id === id
        );

    if (!category) {

        alert(
            "Scroll category not found."
        );

        return;
    }

    document.getElementById(
        "editingScrollCategoryId"
    ).value =
        category._id;

    document.getElementById(
        "scrollCategoryTitle"
    ).value =
        category.title || "";

    document.getElementById(
        "scrollCategoryCount"
    ).value =
        category.count || 0;

    document.getElementById(
        "scrollCategoryLink"
    ).value =
        category.link || "";

    document.getElementById(
        "scrollCategoryOrder"
    ).value =
        category.order || 1;

    document.getElementById(
        "scrollCategoryActive"
    ).checked =
        category.active !== false;


    if (category.image) {

        document.getElementById(
            "scrollCategoryImagePreview"
        ).innerHTML = `

            <p>Current Image:</p>

            <img
                src="${getImageUrl(
                    category.image
                )}"
                alt="${escapeHTML(
                    category.title
                )}"
            >

        `;
    }

    showSectionById(
        "scrollCategorySection"
    );
}


async function saveScrollCategory(event) {

    event.preventDefault();

    const editingId =
        document.getElementById(
            "editingScrollCategoryId"
        ).value;

    const imageInput =
        document.getElementById(
            "scrollCategoryImage"
        );

    const formData =
        new FormData();

    formData.append(
        "title",
        document.getElementById(
            "scrollCategoryTitle"
        ).value.trim()
    );

    formData.append(
        "count",
        document.getElementById(
            "scrollCategoryCount"
        ).value
    );

    formData.append(
        "link",
        document.getElementById(
            "scrollCategoryLink"
        ).value.trim()
    );

    formData.append(
        "order",
        document.getElementById(
            "scrollCategoryOrder"
        ).value
    );

    formData.append(
        "active",
        document.getElementById(
            "scrollCategoryActive"
        ).checked
    );


    if (
        imageInput.files &&
        imageInput.files.length
    ) {

        formData.append(
            "image",
            imageInput.files[0]
        );
    }


    const message =
        document.getElementById(
            "scrollCategoryMessage"
        );

    message.textContent =
        editingId
            ? "Updating category..."
            : "Adding category...";


    try {

        const response =
            await fetch(

                editingId
                    ? `${API_URL}/api/scroll-categories/${editingId}`
                    : `${API_URL}/api/scroll-categories`,

                {
                    method:
                        editingId
                            ? "PUT"
                            : "POST",

                    headers:
                        authHeaders(),

                    body:
                        formData
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            message.textContent =
                data.message ||
                "Category operation failed.";

            return;
        }


        message.textContent =
            editingId
                ? "Category updated successfully!"
                : "Category added successfully!";


        await loadScrollCategories();

    } catch (error) {

        console.error(error);

        message.textContent =
            "Unable to connect to server.";
    }
}


async function deleteScrollCategory(id) {

    if (
        !confirm(
            "Are you sure you want to delete this category?"
        )
    ) {
        return;
    }

    try {

        const response =
            await fetch(
                `${API_URL}/api/scroll-categories/${id}`,
                {
                    method: "DELETE",
                    headers: authHeaders()
                }
            );

        const data =
            await response.json();

        if (!response.ok) {

            alert(
                data.message ||
                "Failed to delete category."
            );

            return;
        }

        alert(
            "Scroll category deleted successfully."
        );

        loadScrollCategories();

    } catch (error) {

        console.error(error);

        alert(
            "Unable to connect to server."
        );
    }
}


// =====================================================
// BEST SELLERS
// =====================================================

let allBestSellers = [];


async function loadBestSellerProductOptions() {

    const select =
        document.getElementById(
            "bestSellerProduct"
        );

    if (!select) {
        return;
    }

    try {

        const response =
            await fetch(
                `${API_URL}/api/products`
            );

        const products =
            await response.json();

        if (!response.ok) {
            throw new Error(
                "Failed to load products"
            );
        }

        select.innerHTML =
            `
                <option value="">
                    Select Product
                </option>
            `;


        products.forEach(product => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                product.productId;

            option.textContent =
                `${product.productId} - ${product.name}`;

            option.dataset.name =
                product.name || "";

            option.dataset.price =
                product.price || 0;

            option.dataset.image =
                product.image ||
                (
                    product.images &&
                    product.images.length
                        ? product.images[0]
                        : ""
                );

            select.appendChild(
                option
            );

        });

    } catch (error) {

        console.error(
            "Best seller product options error:",
            error
        );

        select.innerHTML =
            `
                <option value="">
                    Unable to load products
                </option>
            `;
    }
}


async function loadBestSellers() {

    const container =
        document.getElementById(
            "bestSellersContainer"
        );

    if (!container) {
        return;
    }

    container.innerHTML =
        "Loading best sellers...";

    try {

        await loadBestSellerProductOptions();

        const response =
            await fetch(
                `${API_URL}/api/best-sellers`
            );

        const bestSellers =
            await response.json();

        if (!response.ok) {

            throw new Error(
                bestSellers.message ||
                "Failed to load best sellers"
            );
        }

        allBestSellers =
            bestSellers;


        if (!bestSellers.length) {

            container.innerHTML =
                "<p>No best sellers found.</p>";

            return;
        }


        container.innerHTML =
            bestSellers.map(item => {

                const image =
                    getImageUrl(
                        item.image
                    );

                return `

                    <div class="hero-card">

                        ${
                            image
                                ? `
                                    <img
                                        src="${image}"
                                        alt="${escapeHTML(
                                            item.name
                                        )}"
                                    >
                                `
                                :
                                `
                                    <div style="
                                        height:180px;
                                        display:flex;
                                        align-items:center;
                                        justify-content:center;
                                        background:#eee;
                                    ">
                                        No Image
                                    </div>
                                `
                        }

                        <div class="hero-card-content">

                            <h3>
                                ${escapeHTML(
                                    item.name
                                )}
                            </h3>

                            <p>
                                Product ID:
                                ${item.productId}
                            </p>

                            <p>
                                Price:
                                ₹${Number(
                                    item.price || 0
                                ).toFixed(2)}
                            </p>

                            <p>
                                Order:
                                ${item.order || 0}
                            </p>

                            <span class="hero-status">
                                ${
                                    item.active
                                        ? "Active"
                                        : "Inactive"
                                }
                            </span>

                            <div class="product-actions">

                                <button
                                    class="edit-btn"
                                    onclick="editBestSeller('${item._id}')"
                                >
                                    Edit
                                </button>

                                <button
                                    class="delete-btn"
                                    onclick="deleteBestSeller('${item._id}')"
                                >
                                    Delete
                                </button>

                            </div>

                        </div>

                    </div>

                `;

            }).join("");


    } catch (error) {

        console.error(
            "Best seller loading error:",
            error
        );

        container.innerHTML =
            "<p>Failed to load best sellers.</p>";
    }
}


function prepareAddBestSeller() {

    resetBestSellerForm();

    loadBestSellerProductOptions();

    showSectionById(
        "bestSellerSection"
    );
}


function resetBestSellerForm() {

    const form =
        document.getElementById(
            "bestSellerForm"
        );

    if (form) {
        form.reset();
    }

    document.getElementById(
        "editingBestSellerId"
    ).value = "";

    document.getElementById(
        "bestSellerActive"
    ).checked = true;

    document.getElementById(
        "bestSellerOrder"
    ).value = 1;

    document.getElementById(
        "bestSellerImagePreview"
    ).innerHTML = "";

    document.getElementById(
        "bestSellerMessage"
    ).textContent = "";
}


async function editBestSeller(id) {

    const item =
        allBestSellers.find(
            seller => seller._id === id
        );

    if (!item) {

        alert(
            "Best seller not found."
        );

        return;
    }

    await loadBestSellerProductOptions();

    document.getElementById(
        "editingBestSellerId"
    ).value =
        item._id;

    document.getElementById(
        "bestSellerProduct"
    ).value =
        item.productId;

    document.getElementById(
        "bestSellerName"
    ).value =
        item.name || "";

    document.getElementById(
        "bestSellerPrice"
    ).value =
        item.price || 0;

    document.getElementById(
        "bestSellerOrder"
    ).value =
        item.order || 1;

    document.getElementById(
        "bestSellerActive"
    ).checked =
        item.active !== false;


    if (item.image) {

        document.getElementById(
            "bestSellerImagePreview"
        ).innerHTML = `

            <p>Current Image:</p>

            <img
                src="${getImageUrl(
                    item.image
                )}"
                alt="${escapeHTML(
                    item.name
                )}"
            >

        `;
    }

    showSectionById(
        "bestSellerSection"
    );
}


async function saveBestSeller(event) {

    event.preventDefault();

    const editingId =
        document.getElementById(
            "editingBestSellerId"
        ).value;

    const select =
        document.getElementById(
            "bestSellerProduct"
        );

    const imageInput =
        document.getElementById(
            "bestSellerImage"
        );

    const formData =
        new FormData();

    formData.append(
        "productId",
        select.value
    );

    formData.append(
        "name",
        document.getElementById(
            "bestSellerName"
        ).value.trim()
    );

    formData.append(
        "price",
        document.getElementById(
            "bestSellerPrice"
        ).value
    );

    formData.append(
        "active",
        document.getElementById(
            "bestSellerActive"
        ).checked
    );

    formData.append(
        "order",
        document.getElementById(
            "bestSellerOrder"
        ).value
    );


    if (
        imageInput.files &&
        imageInput.files.length
    ) {

        formData.append(
            "image",
            imageInput.files[0]
        );

    } else {

        const option =
            select.options[
                select.selectedIndex
            ];

        if (
            option &&
            option.dataset.image
        ) {

            formData.append(
                "imagePath",
                option.dataset.image
            );
        }
    }


    const message =
        document.getElementById(
            "bestSellerMessage"
        );

    message.textContent =
        editingId
            ? "Updating best seller..."
            : "Adding best seller...";


    try {

        const response =
            await fetch(

                editingId
                    ? `${API_URL}/api/best-sellers/${editingId}`
                    : `${API_URL}/api/best-sellers`,

                {
                    method:
                        editingId
                            ? "PUT"
                            : "POST",

                    headers:
                        authHeaders(),

                    body:
                        formData
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            message.textContent =
                data.message ||
                "Best seller operation failed.";

            return;
        }


        message.textContent =
            editingId
                ? "Best seller updated successfully!"
                : "Best seller added successfully!";


        await loadBestSellers();

    } catch (error) {

        console.error(error);

        message.textContent =
            "Unable to connect to server.";
    }
}


async function deleteBestSeller(id) {

    if (
        !confirm(
            "Are you sure you want to delete this best seller?"
        )
    ) {
        return;
    }

    try {

        const response =
            await fetch(
                `${API_URL}/api/best-sellers/${id}`,
                {
                    method: "DELETE",
                    headers: authHeaders()
                }
            );

        const data =
            await response.json();

        if (!response.ok) {

            alert(
                data.message ||
                "Failed to delete best seller."
            );

            return;
        }

        alert(
            "Best seller deleted successfully."
        );

        loadBestSellers();

    } catch (error) {

        console.error(error);

        alert(
            "Unable to connect to server."
        );
    }
}


// =====================================================
// STANDOUT
// =====================================================

let currentStandout = null;


async function loadStandout() {

    const container =
        document.getElementById(
            "standoutContainer"
        );

    if (!container) {
        return;
    }

    container.innerHTML =
        "Loading standout section...";

    try {

        const response =
            await fetch(
                `${API_URL}/api/standout`
            );


        if (response.status === 404) {

            currentStandout = null;

            container.innerHTML =
                "<p>No standout section configured yet.</p>";

            resetStandoutForm();

            return;
        }


        const standout =
            await response.json();


        if (!response.ok) {

            throw new Error(
                standout.message ||
                "Failed to load standout"
            );
        }


        currentStandout =
            standout;


        document.getElementById(
            "editingStandoutId"
        ).value =
            standout._id || "";


        document.getElementById(
            "standoutTitle"
        ).value =
            standout.title ||
            "What Makes Shailu's Concepts Stand Out?";


        document.getElementById(
            "standoutActive"
        ).checked =
            standout.active !== false;


        const image =
            getImageUrl(
                standout.image
            );


        document.getElementById(
            "standoutImagePreview"
        ).innerHTML =

            image
                ? `
                    <p>Current Image:</p>

                    <img
                        src="${image}"
                        alt="${escapeHTML(
                            standout.title ||
                            "Standout"
                        )}"
                    >
                `
                : "";


        container.innerHTML = `

            <div class="hero-card">

                ${
                    image
                        ? `
                            <img
                                src="${image}"
                                alt="${escapeHTML(
                                    standout.title ||
                                    "Standout"
                                )}"
                            >
                        `
                        :
                        `
                            <div style="
                                height:180px;
                                display:flex;
                                align-items:center;
                                justify-content:center;
                                background:#eee;
                            ">
                                No Image
                            </div>
                        `
                }

                <div class="hero-card-content">

                    <h3>
                        ${escapeHTML(
                            standout.title ||
                            "Standout Section"
                        )}
                    </h3>

                    <span class="hero-status">
                        ${
                            standout.active
                                ? "Active"
                                : "Inactive"
                        }
                    </span>

                    <div class="product-actions">

                        <button
                            class="edit-btn"
                            onclick="editStandout()"
                        >
                            Edit
                        </button>

                        <button
                            class="delete-btn"
                            onclick="deleteStandout()"
                        >
                            Delete
                        </button>

                    </div>

                </div>

            </div>
        `;


    } catch (error) {

        console.error(
            "Standout loading error:",
            error
        );

        container.innerHTML =
            "<p>Failed to load standout section.</p>";
    }
}


function editStandout() {

    if (!currentStandout) {
        return;
    }

    document.getElementById(
        "editingStandoutId"
    ).value =
        currentStandout._id || "";

    document.getElementById(
        "standoutTitle"
    ).value =
        currentStandout.title ||
        "What Makes Shailu's Concepts Stand Out?";

    document.getElementById(
        "standoutActive"
    ).checked =
        currentStandout.active !== false;

    showSectionById(
        "standoutSection"
    );
}


function resetStandoutForm() {

    const form =
        document.getElementById(
            "standoutForm"
        );

    if (form) {
        form.reset();
    }

    document.getElementById(
        "editingStandoutId"
    ).value =
        currentStandout
            ? currentStandout._id || ""
            : "";

    document.getElementById(
        "standoutTitle"
    ).value =
        currentStandout?.title ||
        "What Makes Shailu's Concepts Stand Out?";

    document.getElementById(
        "standoutActive"
    ).checked =
        currentStandout
            ? currentStandout.active !== false
            : true;

    document.getElementById(
        "standoutImagePreview"
    ).innerHTML = "";

    document.getElementById(
        "standoutMessage"
    ).textContent = "";
}


async function saveStandout(event) {

    event.preventDefault();

    const editingId =
        document.getElementById(
            "editingStandoutId"
        ).value;

    const imageInput =
        document.getElementById(
            "standoutImage"
        );

    const formData =
        new FormData();

    formData.append(
        "title",
        document.getElementById(
            "standoutTitle"
        ).value.trim()
    );

    formData.append(
        "active",
        document.getElementById(
            "standoutActive"
        ).checked
    );


    if (
        imageInput.files &&
        imageInput.files.length
    ) {

        formData.append(
            "image",
            imageInput.files[0]
        );
    }


    const message =
        document.getElementById(
            "standoutMessage"
        );

    message.textContent =
        editingId
            ? "Updating standout..."
            : "Uploading standout...";


    try {

        const response =
            await fetch(

                editingId
                    ? `${API_URL}/api/standout/${editingId}`
                    : `${API_URL}/api/standout`,

                {
                    method:
                        editingId
                            ? "PUT"
                            : "POST",

                    headers:
                        authHeaders(),

                    body:
                        formData
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            message.textContent =
                data.message ||
                "Standout operation failed.";

            return;
        }


        message.textContent =
            editingId
                ? "Standout updated successfully!"
                : "Standout added successfully!";


        await loadStandout();

    } catch (error) {

        console.error(
            "Standout save error:",
            error
        );

        message.textContent =
            "Unable to connect to server.";
    }
}


async function deleteStandout() {

    if (!currentStandout?._id) {

        alert(
            "No standout section found."
        );

        return;
    }

    if (
        !confirm(
            "Are you sure you want to delete the standout section?"
        )
    ) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/api/standout/${currentStandout._id}`,
                {
                    method: "DELETE",
                    headers: authHeaders()
                }
            );

        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.message ||
                "Failed to delete standout."
            );

            return;
        }


        alert(
            "Standout section deleted successfully."
        );


        currentStandout = null;

        loadStandout();

    } catch (error) {

        console.error(error);

        alert(
            "Unable to connect to server."
        );
    }
}


// =====================================================
// BEST SELLER PRODUCT CHANGE
// =====================================================

document.addEventListener(
    "change",
    function(event) {

        if (
            !event.target ||
            event.target.id !==
                "bestSellerProduct"
        ) {
            return;
        }


        const select =
            event.target;

        const option =
            select.options[
                select.selectedIndex
            ];

        if (!option) {
            return;
        }


        const name =
            document.getElementById(
                "bestSellerName"
            );

        const price =
            document.getElementById(
                "bestSellerPrice"
            );

        const preview =
            document.getElementById(
                "bestSellerImagePreview"
            );


        if (name) {

            name.value =
                option.dataset.name || "";
        }


        if (price) {

            price.value =
                option.dataset.price || 0;
        }


        if (
            preview &&
            option.dataset.image
        ) {

            preview.innerHTML = `

                <p>Product Image:</p>

                <img
                    src="${getImageUrl(
                        option.dataset.image
                    )}"
                    alt="Product image"
                >

            `;
        }

    }
);


// =====================================================
// IMAGE PREVIEWS
// =====================================================

document.addEventListener(
    "change",
    function(event) {

        const input =
            event.target;

        if (!input) {
            return;
        }


        const previewMap = {

            productImage:
                "mainImagePreview",

            productImages:
                "additionalImagesPreview",

            heroImage:
                "heroImagePreview",

            scrollCategoryImage:
                "scrollCategoryImagePreview",

            bestSellerImage:
                "bestSellerImagePreview",

            standoutImage:
                "standoutImagePreview"

        };


        const previewId =
            previewMap[input.id];


        if (!previewId) {
            return;
        }


        const preview =
            document.getElementById(
                previewId
            );

        if (!preview) {
            return;
        }


        preview.innerHTML = "";


        if (
            !input.files ||
            !input.files.length
        ) {
            return;
        }


        Array.from(
            input.files
        ).forEach(file => {

            const image =
                document.createElement(
                    "img"
                );

            image.src =
                URL.createObjectURL(
                    file
                );

            preview.appendChild(
                image
            );

        });

    }
);


// =====================================================
// LOGOUT
// =====================================================

function logout() {

    localStorage.removeItem(
        "adminToken"
    );

    localStorage.removeItem(
        "token"
    );

    localStorage.removeItem(
        "admin"
    );

    window.location.href =
        "admin-login.html";
}


// =====================================================
// INITIAL LOAD
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        console.log(
            "Admin dashboard loaded"
        );

        loadDashboardStats();

    }
);