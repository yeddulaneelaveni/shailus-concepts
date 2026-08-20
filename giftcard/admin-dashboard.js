const API_URL = "http://localhost:5000";


// =====================================================
// CHECK ADMIN LOGIN
// =====================================================

const adminToken =
    localStorage.getItem("adminToken");

const adminData =
    JSON.parse(
        localStorage.getItem("admin") || "null"
    );


if (!adminToken || !adminData) {

    window.location.href = "admin-login.html";

}


// =====================================================
// SHOW ADMIN NAME
// =====================================================

if (adminData) {

    document.getElementById("adminName").textContent =
        adminData.email || "Admin";

}


// =====================================================
// LOGOUT
// =====================================================

function logout() {

    localStorage.removeItem("adminToken");

    localStorage.removeItem("admin");

    window.location.href =
        "admin-login.html";
}


// =====================================================
// SECTION NAVIGATION
// =====================================================

function showSection(
    sectionId,
    button
) {

    document
        .querySelectorAll(".dashboard-section")
        .forEach(section => {

            section.classList.remove(
                "active-section"
            );

        });


    document
        .getElementById(sectionId)
        .classList.add(
            "active-section"
        );


    document
        .querySelectorAll(".sidebar-btn")
        .forEach(btn => {

            btn.classList.remove("active");

        });


    button.classList.add("active");
}


function showSectionById(sectionId) {

    document
        .querySelectorAll(".dashboard-section")
        .forEach(section => {

            section.classList.remove(
                "active-section"
            );

        });


    document
        .getElementById(sectionId)
        .classList.add(
            "active-section"
        );


    document
        .querySelectorAll(".sidebar-btn")
        .forEach(btn => {

            btn.classList.remove("active");

        });

}


// =====================================================
// LOAD PRODUCTS
// =====================================================

let allProducts = [];


async function loadProducts() {

    const container =
        document.getElementById(
            "productsContainer"
        );

    container.innerHTML =
        "Loading products...";


    try {

        const response =
            await fetch(
                `${API_URL}/api/products`
            );


        if (!response.ok) {

            throw new Error(
                "Failed to load products"
            );

        }


        allProducts =
            await response.json();


        renderProducts(
            allProducts
        );


        updateStatistics();

    } catch (error) {

        console.error(error);

        container.innerHTML =
            `<p>Failed to load products.</p>`;

    }
}


// =====================================================
// RENDER PRODUCTS
// =====================================================

function renderProducts(products) {

    const container =
        document.getElementById(
            "productsContainer"
        );


    if (!products.length) {

        container.innerHTML =
            `<p>No products found.</p>`;

        return;
    }


    container.innerHTML =
        products.map(product => {

            const imagePath =
    product.image ||
    (
        product.images &&
        product.images.length
            ? product.images[0]
            : ""
    );

const image =
    imagePath
        ? (
            imagePath.startsWith("http")
                ? imagePath
                : imagePath.startsWith("/uploads/")
                    ? `${API_URL}${imagePath}`
                    : imagePath
        )
        : "";


            return `

                <div class="product-card">

                    ${
                        image
                            ? `<img src="${image}" alt="${product.name}">`
                            : `<div style="height:190px;display:flex;align-items:center;justify-content:center;background:#eee;">
                                No Image
                              </div>`
                    }


                    <div class="product-info">

                        <h3>
                            ${escapeHTML(product.name)}
                        </h3>


                        <p>
                            Product ID:
                            ${product.productId}
                        </p>


                        <p>
                            Category:
                            ${escapeHTML(product.category)}
                        </p>


                        <p>
                            Price:
                            ₹${product.price}
                        </p>


                        <p>
                            Rating:
                            ${product.rating}
                        </p>


                        <div class="product-actions">

                            <button
                                class="edit-btn"
                                onclick="editProduct(${product.productId})"
                            >
                                Edit
                            </button>


                            <button
                                class="delete-btn"
                                onclick="deleteProduct(${product.productId})"
                            >
                                Delete
                            </button>

                        </div>

                    </div>

                </div>

            `;

        }).join("");
}


// =====================================================
// SEARCH PRODUCTS
// =====================================================

function searchProducts() {

    const search =
        document
            .getElementById(
                "productSearch"
            )
            .value
            .toLowerCase();


    const filtered =
        allProducts.filter(product =>

            product.name
                .toLowerCase()
                .includes(search)

            ||

            product.category
                .toLowerCase()
                .includes(search)

            ||

            String(product.productId)
                .includes(search)

        );


    renderProducts(filtered);
}


// =====================================================
// EDIT PRODUCT
// =====================================================

async function editProduct(productId) {

    try {

        const response =
            await fetch(
                `${API_URL}/api/products/${productId}`
            );


        const product =
            await response.json();


        if (!response.ok) {

            alert(
                product.message ||
                "Product not found"
            );

            return;
        }


        document
            .getElementById(
                "editingProductId"
            )
            .value = product.productId;


        document
            .getElementById(
                "productId"
            )
            .value = product.productId;


        document
            .getElementById(
                "productId"
            )
            .disabled = true;


        document
            .getElementById(
                "productName"
            )
            .value = product.name;


        document
            .getElementById(
                "productCategory"
            )
            .value = product.category;


        document
            .getElementById(
                "productPrice"
            )
            .value = product.price;


        document
            .getElementById(
                "productDimensions"
            )
            .value =
                product.dimensions || "";


        document
            .getElementById(
                "productRating"
            )
            .value =
                product.rating || 0;


        document
            .getElementById(
                "productBadge"
            )
            .value =
                product.badge || "";

        document
            .getElementById(
                "productDescription"
            )
            .value =
                product.description || "";


        document
            .getElementById(
                "productNewArrival"
            )
            .checked =
                product.newArrival;


        document
            .getElementById(
                "productBestSeller"
            )
            .checked =
                product.bestSeller;


        document
            .getElementById(
                "productFormTitle"
            )
            .textContent =
                "Edit Product";


        showSectionById(
            "addProductSection"
        );

    } catch (error) {

        console.error(error);

        alert(
            "Failed to load product"
        );

    }
}


// =====================================================
// ADD / UPDATE PRODUCT
// =====================================================

async function saveProduct(event) {

    event.preventDefault();

    const editingId =
        document.getElementById(
            "editingProductId"
        ).value;


    const productId =
        document.getElementById(
            "productId"
        ).value;


    const mainImageInput =
        document.getElementById(
            "productImage"
        );


    const additionalImagesInput =
        document.getElementById(
            "productImages"
        );


    // ==========================================
    // CREATE FORMDATA
    // ==========================================

    const formData = new FormData();


    formData.append(
        "productId",
        productId
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
        "badge",
        document.getElementById(
            "productBadge"
        ).value.trim()
    );


    formData.append(
        "rating",
        document.getElementById(
            "productRating"
        ).value
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


    formData.append(
        "description",
        document.getElementById(
            "productDescription"
        ).value.trim()
    );


    formData.append(
        "dimensions",
        document.getElementById(
            "productDimensions"
        ).value.trim()
    );


    // ==========================================
    // MAIN IMAGE
    // ==========================================

    if (
        mainImageInput.files &&
        mainImageInput.files.length > 0
    ) {

        formData.append(
            "mainImage",
            mainImageInput.files[0]
        );

    }


    // ==========================================
    // ADDITIONAL IMAGES
    // ==========================================

    if (
        additionalImagesInput.files &&
        additionalImagesInput.files.length > 0
    ) {

        Array.from(
            additionalImagesInput.files
        ).forEach(file => {

            formData.append(
                "additionalImages",
                file
            );

        });

    }


    const message =
        document.getElementById(
            "productMessage"
        );


    message.style.color =
        "#0d3328";

    message.textContent =
        editingId
            ? "Updating product..."
            : "Adding product...";


    try {

        let response;


        // ==========================================
        // UPDATE
        // ==========================================

        if (editingId) {

            response =
                await fetch(
                    `${API_URL}/api/products/${editingId}`,
                    {
                        method: "PUT",

                        headers: {
                            "Authorization":
                                `Bearer ${adminToken}`
                        },

                        body: formData
                    }
                );

        }


        // ==========================================
        // CREATE
        // ==========================================

        else {

            response =
                await fetch(
                    `${API_URL}/api/products`,
                    {
                        method: "POST",

                        headers: {
                            "Authorization":
                                `Bearer ${adminToken}`
                        },

                        body: formData
                    }
                );

        }


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


        // Refresh product list
        await loadProducts();


        // Clear form
        resetProductForm();


        setTimeout(() => {

            showSectionById(
                "productsSection"
            );

        }, 800);


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


// =====================================================
// DELETE PRODUCT
// =====================================================

async function deleteProduct(productId) {

    const confirmDelete =
        confirm(
            `Are you sure you want to delete product ${productId}?`
        );


    if (!confirmDelete) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/api/products/${productId}`,
                {
                    method: "DELETE",

                    headers: {
                        "Authorization":
                            `Bearer ${adminToken}`
                    }
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.message ||
                "Failed to delete product"
            );

            return;
        }


        alert(
            "Product deleted successfully"
        );


        loadProducts();


    } catch (error) {

        console.error(error);

        alert(
            "Unable to connect to server"
        );

    }
}


// =====================================================
// RESET PRODUCT FORM
// =====================================================

function resetProductForm() {

    document
        .getElementById(
            "productForm"
        )
        .reset();


    document
        .getElementById(
            "editingProductId"
        )
        .value = "";


    document
        .getElementById(
            "productId"
        )
        .disabled = false;


    document
        .getElementById(
            "productFormTitle"
        )
        .textContent =
            "Add Product";


    document
        .getElementById(
            "productMessage"
        )
        .textContent = "";


    document
        .getElementById(
            "mainImagePreview"
        )
        .innerHTML = "";


    document
        .getElementById(
            "additionalImagesPreview"
        )
        .innerHTML = "";

}


function prepareAddProduct() {

    resetProductForm();

}


// =====================================================
// STATISTICS
// =====================================================

function updateStatistics() {

    document
        .getElementById(
            "totalProducts"
        )
        .textContent =
            allProducts.length;


    document
        .getElementById(
            "newArrivals"
        )
        .textContent =
            allProducts.filter(
                p => p.newArrival
            ).length;


    document
        .getElementById(
            "bestSellers"
        )
        .textContent =
            allProducts.filter(
                p => p.bestSeller
            ).length;

}


// =====================================================
// HERO PLACEHOLDERS
// =====================================================

async function loadHeroes() {

    const container =
        document.getElementById(
            "heroesContainer"
        );


    container.innerHTML =
        "Loading hero slides...";


    try {

        const response =
            await fetch(
                `${API_URL}/api/hero`
            );


        if (!response.ok) {

            throw new Error(
                "Failed to load heroes"
            );

        }


        const heroes =
            await response.json();


        document
            .getElementById(
                "totalHeroes"
            )
            .textContent =
                heroes.length;


        if (!heroes.length) {

            container.innerHTML =
                "<p>No hero slides found.</p>";

            return;
        }


        container.innerHTML =
            heroes.map(hero => `

                <div class="hero-card">

                    <img
                        src="${API_URL}${hero.image}"
                        alt="${escapeHTML(hero.title)}"
                    >

                    <div class="hero-card-content">

                        <h3>
                            ${escapeHTML(hero.title)}
                        </h3>

                        <p>
                            ${escapeHTML(hero.subtitle || "")}
                        </p>

                        <p>
                            Order:
                            ${hero.order}
                        </p>

                        <span class="hero-status">
                            ${hero.active ? "Active" : "Inactive"}
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

            `).join("");


    } catch (error) {

        console.error(error);

        container.innerHTML =
            "<p>Failed to load hero slides.</p>";

    }
}

async function editHero(id) {

    try {

        const response =
            await fetch(
                `${API_URL}/api/hero/${id}`
            );


        const hero =
            await response.json();


        if (!response.ok) {

            alert(
                hero.message ||
                "Hero not found"
            );

            return;
        }


        document.getElementById(
            "editingHeroId"
        ).value = hero._id;


        document.getElementById(
            "heroTitle"
        ).value = hero.title;


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
            hero.buttonLink || "";


        document.getElementById(
            "heroOrder"
        ).value =
            hero.order || 1;


        document.getElementById(
            "heroActive"
        ).checked =
            hero.active;


        // Existing image preview
        document.getElementById(
            "heroImagePreview"
        ).innerHTML = `

            <p>Current Image:</p>

            <img
                src="${API_URL}${hero.image}"
                alt="${escapeHTML(hero.title)}"
            >

        `;


        // Image is optional while editing
        document.getElementById(
            "heroImage"
        ).required = false;


        showSectionById(
            "heroSection"
        );


    } catch (error) {

        console.error(error);

        alert(
            "Failed to load hero"
        );

    }
}
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
                `${API_URL}/api/hero/${id}`,
                {
                    method: "DELETE",

                    headers: {
                        "Authorization":
                            `Bearer ${adminToken}`
                    }
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.message ||
                "Failed to delete hero"
            );

            return;
        }


        alert(
            "Hero deleted successfully"
        );


        loadHeroes();


    } catch (error) {

        console.error(error);

        alert(
            "Unable to connect to server"
        );

    }
}

function prepareAddHero() {

    document
        .getElementById(
            "heroForm"
        )
        .reset();


    document
        .getElementById(
            "editingHeroId"
        )
        .value = "";

}


async function saveHero(event) {

    event.preventDefault();

    const editingId =
        document.getElementById(
            "editingHeroId"
        ).value;


    const imageInput =
        document.getElementById(
            "heroImage"
        );


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
        "active",
        document.getElementById(
            "heroActive"
        ).checked
    );


    formData.append(
        "order",
        document.getElementById(
            "heroOrder"
        ).value
    );


    if (
        imageInput.files &&
        imageInput.files.length > 0
    ) {

        formData.append(
            "heroImage",
            imageInput.files[0]
        );

    }


    const message =
        document.getElementById(
            "heroMessage"
        );


    message.style.color =
        "#0d3328";

    message.textContent =
        editingId
            ? "Updating hero..."
            : "Uploading hero...";


    try {

        let response;


        if (editingId) {

            response =
                await fetch(
                    `${API_URL}/api/hero/${editingId}`,
                    {
                        method: "PUT",

                        headers: {
                            "Authorization":
                                `Bearer ${adminToken}`
                        },

                        body: formData
                    }
                );

        } else {

            response =
                await fetch(
                    `${API_URL}/api/hero`,
                    {
                        method: "POST",

                        headers: {
                            "Authorization":
                                `Bearer ${adminToken}`
                        },

                        body: formData
                    }
                );

        }


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


        resetHeroForm();

        await loadHeroes();

        updateHeroStatistics();


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


function resetHeroForm() {

    document
        .getElementById(
            "heroForm"
        )
        .reset();


    document
        .getElementById(
            "editingHeroId"
        )
        .value = "";


    document
        .getElementById(
            "heroImagePreview"
        )
        .innerHTML = "";


    document
        .getElementById(
            "heroImage"
        ).required = true;


    document
        .getElementById(
            "heroMessage"
        )
        .textContent = "";

}


// =====================================================
// HTML ESCAPE
// =====================================================

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}



// =====================================================
// MAIN IMAGE PREVIEW
// =====================================================

document
    .getElementById("productImage")
    .addEventListener("change", function () {

        const preview =
            document.getElementById(
                "mainImagePreview"
            );


        preview.innerHTML = "";


        const file = this.files[0];


        if (!file) {
            return;
        }


        const image =
            document.createElement("img");


        image.src =
            URL.createObjectURL(file);


        preview.appendChild(image);

    });


// =====================================================
// ADDITIONAL IMAGE PREVIEW
// =====================================================

document
    .getElementById("productImages")
    .addEventListener("change", function () {

        const preview =
            document.getElementById(
                "additionalImagesPreview"
            );


        preview.innerHTML = "";


        Array.from(this.files)
            .forEach(file => {

                const image =
                    document.createElement("img");


                image.src =
                    URL.createObjectURL(file);


                preview.appendChild(image);

            });

    });
// =====================================================
// INITIAL LOAD
// =====================================================

loadProducts();