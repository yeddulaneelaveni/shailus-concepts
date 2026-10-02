// =====================================================
// ADMIN DASHBOARD JAVASCRIPT
// =====================================================

const API_URL = "http://localhost:5000";


// =====================================================
// GLOBAL DATA
// =====================================================

let allProducts = [];
let allHeroes = [];
let allScrollCategories = [];
let allBestSellers = [];
let currentStandout = null;


// =====================================================
// AUTH
// =====================================================

function authHeaders() {

    const token =
        localStorage.getItem("adminToken") ||
        localStorage.getItem("token") ||
        "";

    if (!token) {
        return {};
    }

    return {
        Authorization: `Bearer ${token}`
    };
}


// =====================================================
// SAFE JSON RESPONSE
// =====================================================

async function parseResponse(response) {

    const text = await response.text();

    if (response.status === 401) {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("token");
        localStorage.removeItem("admin");

        if (window.location.pathname.toLowerCase().indexOf("admin-login") === -1) {
            window.location.href = "admin-login.html";
        }
    }

    if (!text) {
        return {};
    }

    try {
        const data = JSON.parse(text);
        if (response.status === 401 && data && data.message) {
            data.message = "Session expired. Please log in again.";
        }
        return data;
    } catch (error) {
        return {
            message: text
        };
    }
}


// =====================================================
// HELPERS
// =====================================================

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function getImageUrl(image) {

    if (!image) {
        return "";
    }

    image = String(image);

    if (
        image.startsWith("http://") ||
        image.startsWith("https://")
    ) {
        return image;
    }

    if (image.startsWith("/")) {
        return `${API_URL}${image}`;
    }

    return `${API_URL}/${image}`;
}


function getProductsArray(data) {

    if (Array.isArray(data)) {
        return data;
    }

    if (Array.isArray(data.products)) {
        return data.products;
    }

    return [];
}


function getHeroesArray(data) {

    if (Array.isArray(data)) {
        return data;
    }

    if (Array.isArray(data.heroes)) {
        return data.heroes;
    }

    if (data && data._id) {
        return [data];
    }

    return [];
}


// =====================================================
// SECTION NAVIGATION
// =====================================================

function showSection(sectionId, button) {

    console.log(
        "Opening section:",
        sectionId
    );

    const section =
        document.getElementById(sectionId);

    if (!section) {

        console.error(
            "Section not found:",
            sectionId
        );

        return;
    }


    document
        .querySelectorAll(".dashboard-section")
        .forEach(section => {

            section.classList.remove(
                "active-section"
            );

        });


    section.classList.add(
        "active-section"
    );


    document
        .querySelectorAll(".sidebar-btn")
        .forEach(btn => {

            btn.classList.remove(
                "active"
            );

        });


    if (button) {

        button.classList.add(
            "active"
        );

    }

}


function showSectionById(sectionId) {

    const section =
        document.getElementById(sectionId);

    if (!section) {

        console.error(
            "Section not found:",
            sectionId
        );

        return;
    }


    document
        .querySelectorAll(".dashboard-section")
        .forEach(section => {

            section.classList.remove(
                "active-section"
            );

        });


    section.classList.add(
        "active-section"
    );


    document
        .querySelectorAll(".sidebar-btn")
        .forEach(btn => {

            btn.classList.remove(
                "active"
            );

        });

}


// =====================================================
// DASHBOARD STATISTICS
// =====================================================

async function loadDashboardStats() {

    // ---------------------------------------------
    // PRODUCT COUNTS
    // ---------------------------------------------

    try {

        const response =
            await fetch(
                `${API_URL}/api/products`
            );


        const data =
            await parseResponse(response);


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to load products"
            );

        }


        const products =
            getProductsArray(data);


        const totalProducts =
            document.getElementById(
                "totalProducts"
            );


        const newArrivals =
            document.getElementById(
                "newArrivals"
            );


        const bestSellers =
            document.getElementById(
                "bestSellers"
            );


        if (totalProducts) {

            totalProducts.textContent =
                products.length;

        }


        if (newArrivals) {

            newArrivals.textContent =
                products.filter(
                    product =>
                        product.newArrival === true
                ).length;

        }


        if (bestSellers) {

            bestSellers.textContent =
                products.filter(
                    product =>
                        product.bestSeller === true
                ).length;

        }


    } catch (error) {

        console.error(
            "Dashboard product statistics error:",
            error
        );

    }


    // ---------------------------------------------
    // HERO COUNT
    // IMPORTANT: backend is /api/hero
    // ---------------------------------------------

    try {

        const response =
            await fetch(
                `${API_URL}/api/hero`
            );


        const data =
            await parseResponse(response);


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to load heroes"
            );

        }


        const heroes =
            getHeroesArray(data);


        const totalHeroes =
            document.getElementById(
                "totalHeroes"
            );


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

async function loadProducts() {

    const container =
        document.getElementById(
            "productsContainer"
        );


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


        const data =
            await parseResponse(response);


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to load products"
            );

        }


        allProducts =
            getProductsArray(data);

        renderProducts(
            allProducts
        );

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


// =====================================================
// RENDER PRODUCTS
// =====================================================

function renderProducts(products) {

    const container =
        document.getElementById(
            "productsContainer"
        );


    if (!container) {
        return;
    }


    if (
        !Array.isArray(products) ||
        products.length === 0
    ) {

        container.innerHTML =
            "<p>No products found.</p>";

        return;
    }


    container.innerHTML =
        products.map(product => {


            const mainImage =
                product.image ||
                (
                    Array.isArray(
                        product.images
                    ) &&
                    product.images.length > 0
                        ? product.images[0]
                        : ""
                );


            const image =
                getImageUrl(
                    mainImage
                );


            const productId =
                Number(
                    product.productId
                );


            return `

                <div class="product-card">

                    ${
                        image
                            ? `

                                <img
                                    src="${escapeHTML(image)}"
                                    alt="${escapeHTML(
                                        product.name ||
                                        "Product"
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
                                product.name ||
                                "Unnamed Product"
                            )}
                        </h3>


                        <p>
                            <strong>ID:</strong>
                            ${escapeHTML(
                                product.productId ?? "-"
                            )}
                        </p>


                        <p>
                            <strong>Category:</strong>
                            ${escapeHTML(
                                product.category || "-"
                            )}
                        </p>


                        <p>
                            <strong>Price:</strong>
                            ₹${Number(
                                product.price || 0
                            ).toFixed(2)}
                        </p>


                        <p>
                            <strong>Dimensions:</strong>
                            ${escapeHTML(
                                product.dimensions || "-"
                            )}
                        </p>


                        <p>
                            <strong>Shape:</strong>
                            ${escapeHTML(
                                product.shape || "-"
                            )}
                        </p>


                        <p>
                            <strong>Colour:</strong>
                            ${escapeHTML(
                                product.colour || "-"
                            )}
                        </p>


                        <p>
                            <strong>Material:</strong>
                            ${escapeHTML(
                                product.material || "-"
                            )}
                        </p>


                        <p>
                            <strong>MOQ:</strong>
                            ${escapeHTML(
                                product.moq ?? "-"
                            )}
                        </p>


                        <p>
                            <strong>Customization:</strong>
                            ${escapeHTML(
                                product.customization || "-"
                            )}
                        </p>


                        <p>
                            <strong>Rating:</strong>
                            ${escapeHTML(
                                product.rating ?? 0
                            )}
                        </p>


                        ${
                            product.badge
                                ? `

                                    <p>
                                        <strong>Badge:</strong>
                                        ${escapeHTML(
                                            product.badge
                                        )}
                                    </p>

                                `
                                : ""
                        }


                        <div
                            style="
                                margin-top:10px;
                                display:flex;
                                gap:8px;
                                flex-wrap:wrap;
                            "
                        >

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

                            ${
                                Number.isInteger(
                                    productId
                                ) &&
                                productId > 0
                                    ? `

                                        <button
                                            type="button"
                                            class="edit-btn"
                                            onclick="editProduct(${productId})"
                                        >
                                            Edit
                                        </button>

                                    `
                                    : ""
                            }


                            <button
                            type="button"
                            class="delete-btn"
                            onclick="deleteProduct(${Number(product.productId)})"
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
// PRODUCT SEARCH
// =====================================================

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

                ||

                String(
                    product.shape || ""
                )
                    .toLowerCase()
                    .includes(search)

                ||

                String(
                    product.colour || ""
                )
                    .toLowerCase()
                    .includes(search)

                ||

                String(
                    product.material || ""
                )
                    .toLowerCase()
                    .includes(search)

            );

        });


    renderProducts(
        filtered
    );

}


// =====================================================
// ADD PRODUCT
// =====================================================

function prepareAddProduct() {

    resetProductForm();

    showSectionById(
        "addProductSection"
    );

}


// =====================================================
// RESET PRODUCT FORM
// =====================================================

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


    const productId =
        document.getElementById(
            "productId"
        );


    if (productId) {

        productId.readOnly = false;

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


// =====================================================
// EDIT PRODUCT
// =====================================================

async function editProduct(productId) {

    const id =
        Number(productId);


    if (
        !Number.isInteger(id) ||
        id <= 0
    ) {

        alert(
            "Invalid product ID."
        );

        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/api/products/${id}`
            );


        const data =
            await parseResponse(
                response
            );


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Product not found"
            );

        }


        const product =
            data.product ||
            data;


        if (!product) {

            throw new Error(
                "Product data not found"
            );

        }


        showSectionById(
            "addProductSection"
        );


        // ---------------------------------------------
        // EDITING ID
        // ---------------------------------------------

        document.getElementById(
            "editingProductId"
        ).value =
            product.productId || id;


        // ---------------------------------------------
        // PRODUCT ID
        // ---------------------------------------------

        const productIdInput =
            document.getElementById(
                "productId"
            );


        if (productIdInput) {

            productIdInput.value =
                product.productId || id;

            productIdInput.readOnly =
                true;

        }


        // ---------------------------------------------
        // BASIC FIELDS
        // ---------------------------------------------

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
            product.price ?? "";


        document.getElementById(
            "productDimensions"
        ).value =
            product.dimensions || "";


        // ---------------------------------------------
        // SHAPE
        // ---------------------------------------------

        document.getElementById(
            "productShape"
        ).value =
            product.shape || "";


        // ---------------------------------------------
        // COLOUR
        // ---------------------------------------------

        document.getElementById(
            "productColour"
        ).value =
            product.colour || "";


        // ---------------------------------------------
        // MATERIAL
        // ---------------------------------------------

        document.getElementById(
            "productMaterial"
        ).value =
            product.material || "";


        // ---------------------------------------------
        // MOQ
        // ---------------------------------------------

        document.getElementById(
            "productMOQ"
        ).value =
            product.moq ?? 1;


        // ---------------------------------------------
        // CUSTOMIZATION
        // ---------------------------------------------

        document.getElementById(
            "productCustomization"
        ).value =
            product.customization || "";


        // ---------------------------------------------
        // RATING
        // ---------------------------------------------

        document.getElementById(
            "productRating"
        ).value =
            product.rating ?? 0;


        // ---------------------------------------------
        // BADGE
        // ---------------------------------------------

        document.getElementById(
            "productBadge"
        ).value =
            product.badge || "";


        // ---------------------------------------------
        // DESCRIPTION
        // ---------------------------------------------

        document.getElementById(
            "productDescription"
        ).value =
            product.description || "";

        // ---------------------------------------------
        // NEW ARRIVAL
        // ---------------------------------------------

        document.getElementById(
            "productNewArrival"
        ).checked =
            product.newArrival === true;


        // ---------------------------------------------
        // BEST SELLER
        // ---------------------------------------------

        document.getElementById(
            "productBestSeller"
        ).checked =
            product.bestSeller === true;


        // ---------------------------------------------
        // FORM TITLE
        // ---------------------------------------------

        document.getElementById(
            "productFormTitle"
        ).textContent =
            "Edit Product";


        // ---------------------------------------------
        // MAIN IMAGE PREVIEW
        // ---------------------------------------------

        const mainPreview =
            document.getElementById(
                "mainImagePreview"
            );


        const mainImage =
            product.image ||
            (
                Array.isArray(
                    product.images
                ) &&
                product.images.length
                    ? product.images[0]
                    : ""
            );


        if (
            mainPreview &&
            mainImage
        ) {

            mainPreview.innerHTML = `

                <p>Current Image:</p>

                <img
                    src="${escapeHTML(
                        getImageUrl(mainImage)
                    )}"
                    alt="${escapeHTML(
                        product.name ||
                        "Product"
                    )}"
                    style="
                        width:150px;
                        height:150px;
                        object-fit:cover;
                        border-radius:8px;
                    "
                >

            `;

        }


        // ---------------------------------------------
        // ADDITIONAL IMAGE PREVIEW
        // ---------------------------------------------

        const additionalPreview =
            document.getElementById(
                "additionalImagesPreview"
            );


        if (additionalPreview) {

            additionalPreview.innerHTML = "";


            if (
                Array.isArray(
                    product.images
                )
            ) {

                product.images.forEach(
                    image => {

                        if (!image) {
                            return;
                        }


                        const img =
                            document.createElement(
                                "img"
                            );


                        img.src =
                            getImageUrl(
                                image
                            );


                        img.alt =
                            "Product image";


                        img.style.width =
                            "120px";


                        img.style.height =
                            "120px";


                        img.style.objectFit =
                            "cover";


                        img.style.borderRadius =
                            "8px";


                        additionalPreview.appendChild(
                            img
                        );

                    }
                );

            }

        }


    } catch (error) {

        console.error(
            "Edit product error:",
            error
        );


        alert(
            error.message ||
            "Unable to load product."
        );

    }

}


// =====================================================
// SAVE / UPDATE PRODUCT
// =====================================================

async function saveProduct(event) {

    event.preventDefault();


    const editingInput =
        document.getElementById(
            "editingProductId"
        );


    const editingId =
        editingInput
            ? editingInput.value.trim()
            : "";


    let productId =
        null;


    // ---------------------------------------------
    // UPDATE ID VALIDATION
    // ---------------------------------------------

    if (editingId) {

        productId =
            Number(editingId);


        if (
            !Number.isInteger(
                productId
            ) ||
            productId <= 0
        ) {

            alert(
                "Invalid product ID."
            );

            return;

        }

    }


    const message =
        document.getElementById(
            "productMessage"
        );


    if (message) {

        message.style.color =
            "#0d3328";

        message.textContent =
            editingId
                ? "Updating product..."
                : "Adding product...";

    }


    try {

        const formData =
            new FormData();


        // ---------------------------------------------
        // PRODUCT ID
        // ---------------------------------------------

        const productIdInput =
            document.getElementById(
                "productId"
            );


        const enteredProductId =
            productIdInput
                ? productIdInput.value.trim()
                : "";


        if (editingId) {

            formData.append(
                "productId",
                String(productId)
            );

        } else {

            if (!enteredProductId) {

                if (message) {

                    message.style.color =
                        "#b33";

                    message.textContent =
                        "Product ID is required.";

                }

                return;

            }


            const newProductId =
                Number(
                    enteredProductId
                );


            if (
                !Number.isInteger(
                    newProductId
                ) ||
                newProductId <= 0
            ) {

                if (message) {

                    message.style.color =
                        "#b33";

                    message.textContent =
                        "Product ID must be a valid number.";

                }

                return;

            }


            formData.append(
                "productId",
                String(newProductId)
            );

        }


        // ---------------------------------------------
        // PRODUCT FIELDS
        // ---------------------------------------------

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
            "shape",
            document.getElementById(
                "productShape"
            ).value.trim()
        );


        formData.append(
            "colour",
            document.getElementById(
                "productColour"
            ).value.trim()
        );


        formData.append(
            "material",
            document.getElementById(
                "productMaterial"
            ).value.trim()
        );


        formData.append(
            "moq",
            document.getElementById(
                "productMOQ"
            ).value
        );


        formData.append(
            "customization",
            document.getElementById(
                "productCustomization"
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
                ? "true"
                : "false"
        );


        formData.append(
            "bestSeller",
            document.getElementById(
                "productBestSeller"
            ).checked
                ? "true"
                : "false"
        );


        // ---------------------------------------------
        // MAIN IMAGE
        // ---------------------------------------------

        const mainImage =
            document.getElementById(
                "productImage"
            );


        if (
            mainImage &&
            mainImage.files &&
            mainImage.files.length > 0
        ) {

            formData.append(
                "mainImage",
                mainImage.files[0]
            );

        }


        // ---------------------------------------------
        // ADDITIONAL IMAGES
        //
        // MUST MATCH:
        // upload.fields([
        //   { name: "mainImage" },
        //   { name: "additionalImages" }
        // ])
        // ---------------------------------------------

        const additionalImages =
            document.getElementById(
                "productImages"
            );


        if (
            additionalImages &&
            additionalImages.files &&
            additionalImages.files.length > 0
        ) {

            for (
                const file of
                additionalImages.files
            ) {

                formData.append(
                    "additionalImages",
                    file
                );

            }

        }


        // ---------------------------------------------
        // URL
        // ---------------------------------------------

        const url =
            editingId
                ? `${API_URL}/api/products/${productId}`
                : `${API_URL}/api/products`;


        // ---------------------------------------------
        // REQUEST
        // ---------------------------------------------

        const response =
            await fetch(
                url,
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
            await parseResponse(
                response
            );


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Product operation failed."
            );

        }


        if (message) {

            message.style.color =
                "#0d3328";

            message.textContent =
                editingId
                    ? "Product updated successfully!"
                    : "Product added successfully!";

        }


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


        if (message) {

            message.style.color =
                "#b33";

            message.textContent =
                error.message ||
                "Unable to connect to server.";

        }

    }

}


// =====================================================
// DELETE PRODUCT
// =====================================================

// =====================================================
// DELETE PRODUCT
// =====================================================

async function deleteProduct(productId) {

    const id = Number(productId);
    const deleteTarget = Number.isInteger(id) ? String(id) : String(productId || "");

    if (
        productId === undefined ||
        productId === null ||
        deleteTarget.trim() === ""
    ) {

        console.error(
            "Invalid product ID received for delete:",
            productId
        );

        alert(
            "Invalid product ID."
        );

        return;
    }

    const confirmDelete =
        confirm(
            `Are you sure you want to delete product ${deleteTarget}?`
        );


    if (!confirmDelete) {
        return;
    }


    try {

        console.log(
            "Deleting product:",
            deleteTarget
        );


        const response =
            await fetch(
                `${API_URL}/api/products/${encodeURIComponent(deleteTarget)}`,
                {
                    method: "DELETE",
                    headers: authHeaders()
                }
            );


        const data =
            await parseResponse(
                response
            );


        if (!response.ok) {

            console.error(
                "Delete product API error:",
                data
            );


            alert(
                data.message ||
                "Failed to delete product."
            );

            return;
        }


        alert(
            "Product deleted successfully."
        );


        // Reload products
        await loadProducts();


        // Refresh dashboard statistics
        await loadDashboardStats();


    } catch (error) {

        console.error(
            "Delete product error:",
            error
        );


        alert(
            error.message ||
            "Unable to connect to server."
        );

    }
}


// =====================================================
// HERO SECTION
// =====================================================

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

        // IMPORTANT:
        // Your working backend endpoint is /api/hero

        const response =
            await fetch(
                `${API_URL}/api/hero`
            );


        const data =
            await parseResponse(
                response
            );


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to load heroes"
            );

        }


        allHeroes =
            getHeroesArray(data);


        renderHeroes(
            allHeroes
        );


    } catch (error) {

        console.error(
            "Hero loading error:",
            error
        );


        container.innerHTML =
            "<p>Failed to load heroes.</p>";

    }

}


// =====================================================
// RENDER HEROES
// =====================================================

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
                                    src="${escapeHTML(image)}"
                                    alt="${escapeHTML(
                                        hero.title ||
                                        "Hero"
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
                                hero.title ||
                                ""
                            )}
                        </h3>


                        <p>
                            ${escapeHTML(
                                hero.subtitle ||
                                ""
                            )}
                        </p>


                        <p>
                            ${escapeHTML(
                                hero.description ||
                                ""
                            )}
                        </p>


                        <p>
                            Order:
                            ${escapeHTML(
                                hero.order ?? 0
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
                                type="button"
                                class="edit-btn"
                                onclick="editHero('${escapeHTML(
                                    hero._id || ""
                                )}')"
                            >
                                Edit
                            </button>


                            <button
                                type="button"
                                class="delete-btn"
                                onclick="deleteHero('${escapeHTML(
                                    hero._id || ""
                                )}')"
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
// ADD HERO
// =====================================================

function prepareAddHero() {

    resetHeroForm();

    showSectionById(
        "heroSection"
    );

}


// =====================================================
// RESET HERO
// =====================================================

function resetHeroForm() {

    const form =
        document.getElementById(
            "heroForm"
        );


    if (form) {
        form.reset();
    }


    const editing =
        document.getElementById(
            "editingHeroId"
        );


    if (editing) {
        editing.value = "";
    }


    const active =
        document.getElementById(
            "heroActive"
        );


    if (active) {
        active.checked = true;
    }


    const order =
        document.getElementById(
            "heroOrder"
        );


    if (order) {
        order.value = 1;
    }


    const buttonText =
        document.getElementById(
            "heroButtonText"
        );


    if (buttonText) {
        buttonText.value =
            "Shop Now";
    }


    const buttonLink =
        document.getElementById(
            "heroButtonLink"
        );


    if (buttonLink) {

        buttonLink.value =
            "index.html#gallery";

    }


    const preview =
        document.getElementById(
            "heroImagePreview"
        );


    if (preview) {
        preview.innerHTML = "";
    }


    const message =
        document.getElementById(
            "heroMessage"
        );


    if (message) {
        message.textContent = "";
    }

}


// =====================================================
// EDIT HERO
// =====================================================

function editHero(id) {

    const hero =
        allHeroes.find(
            item =>
                item._id === id
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
        hero.buttonText ||
        "Shop Now";


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


    const preview =
        document.getElementById(
            "heroImagePreview"
        );


    if (
        preview &&
        hero.image
    ) {

        preview.innerHTML = `

            <p>Current Image:</p>

            <img
                src="${escapeHTML(
                    getImageUrl(
                        hero.image
                    )
                )}"
                alt="${escapeHTML(
                    hero.title ||
                    "Hero"
                )}"
            >

        `;

    }

}


// =====================================================
// SAVE HERO
// =====================================================

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


    if (message) {

        message.textContent =
            editingId
                ? "Updating hero..."
                : "Adding hero...";

    }


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
                ? "true"
                : "false"
        );


        const image =
            document.getElementById(
                "heroImage"
            );


        if (
            image &&
            image.files &&
            image.files.length
        ) {

            formData.append(
                "heroImage",
                image.files[0]
            );

        }


        const url =
            editingId
                ? `${API_URL}/api/hero/${editingId}`
                : `${API_URL}/api/hero`;


        const response =
            await fetch(
                url,
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
            await parseResponse(
                response
            );


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Hero operation failed."
            );

        }


        if (message) {

            message.style.color =
                "#0d3328";

            message.textContent =
                editingId
                    ? "Hero updated successfully!"
                    : "Hero added successfully!";

        }


        await loadHeroes();


    } catch (error) {

        console.error(
            "Hero save error:",
            error
        );


        if (message) {

            message.style.color =
                "#b33";

            message.textContent =
                error.message ||
                "Unable to connect to server.";

        }

    }

}


// =====================================================
// DELETE HERO
// =====================================================

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
                    headers:
                        authHeaders()
                }
            );


        const data =
            await parseResponse(
                response
            );


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to delete hero."
            );

        }


        alert(
            "Hero deleted successfully."
        );


        await loadHeroes();


        loadDashboardStats();


    } catch (error) {

        console.error(
            "Delete hero error:",
            error
        );


        alert(
            error.message ||
            "Unable to connect to server."
        );

    }

}


// =====================================================
// SCROLL CATEGORIES
// =====================================================

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


        const data =
            await parseResponse(
                response
            );


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to load scroll categories"
            );

        }


        allScrollCategories =
            Array.isArray(data)
                ? data
                : Array.isArray(
                    data.categories
                )
                    ? data.categories
                    : [];


        renderScrollCategories(
            allScrollCategories
        );


    } catch (error) {

        console.error(
            "Scroll category loading error:",
            error
        );


        container.innerHTML =
            "<p>Failed to load scroll categories.</p>";

    }

}


// =====================================================
// RENDER SCROLL CATEGORIES
// =====================================================

function renderScrollCategories(
    categories
) {

    const container =
        document.getElementById(
            "scrollCategoriesContainer"
        );


    if (!container) {
        return;
    }


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
                                    src="${escapeHTML(image)}"
                                    alt="${escapeHTML(
                                        category.title ||
                                        "Category"
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
                                category.title ||
                                ""
                            )}
                        </h3>


                        <p>
                            Count:
                            ${escapeHTML(
                                category.count ?? 0
                            )}
                        </p>


                        <p>
                            Order:
                            ${escapeHTML(
                                category.order ?? 0
                            )}
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
                                type="button"
                                class="edit-btn"
                                onclick="editScrollCategory('${escapeHTML(
                                    category._id || ""
                                )}')"
                            >
                                Edit
                            </button>


                            <button
                                type="button"
                                class="delete-btn"
                                onclick="deleteScrollCategory('${escapeHTML(
                                    category._id || ""
                                )}')"
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
// ADD SCROLL CATEGORY
// =====================================================

function prepareAddScrollCategory() {

    resetScrollCategoryForm();

    showSectionById(
        "scrollCategorySection"
    );

}


// =====================================================
// RESET SCROLL CATEGORY
// =====================================================

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


// =====================================================
// EDIT SCROLL CATEGORY
// =====================================================

function editScrollCategory(id) {

    const category =
        allScrollCategories.find(
            item =>
                item._id === id
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
        category.count ?? 0;


    document.getElementById(
        "scrollCategoryLink"
    ).value =
        category.link || "";


    document.getElementById(
        "scrollCategoryOrder"
    ).value =
        category.order ?? 1;


    document.getElementById(
        "scrollCategoryActive"
    ).checked =
        category.active !== false;


    const preview =
        document.getElementById(
            "scrollCategoryImagePreview"
        );


    if (
        preview &&
        category.image
    ) {

        preview.innerHTML = `

            <p>Current Image:</p>

            <img
                src="${escapeHTML(
                    getImageUrl(
                        category.image
                    )
                )}"
                alt="${escapeHTML(
                    category.title ||
                    "Category"
                )}"
            >

        `;

    }


    showSectionById(
        "scrollCategorySection"
    );

}


// =====================================================
// SAVE SCROLL CATEGORY
// =====================================================

async function saveScrollCategory(
    event
) {

    event.preventDefault();


    const editingId =
        document.getElementById(
            "editingScrollCategoryId"
        ).value;


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
            ? "true"
            : "false"
    );


    const imageInput =
        document.getElementById(
            "scrollCategoryImage"
        );


    if (
        imageInput &&
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
            await parseResponse(
                response
            );


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Category operation failed."
            );

        }


        message.textContent =
            editingId
                ? "Category updated successfully!"
                : "Category added successfully!";


        await loadScrollCategories();


    } catch (error) {

        console.error(
            "Scroll category save error:",
            error
        );


        message.style.color =
            "#b33";


        message.textContent =
            error.message ||
            "Unable to connect to server.";

    }

}


// =====================================================
// DELETE SCROLL CATEGORY
// =====================================================

async function deleteScrollCategory(
    id
) {

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
                    headers:
                        authHeaders()
                }
            );


        const data =
            await parseResponse(
                response
            );


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to delete category."
            );

        }


        alert(
            "Scroll category deleted successfully."
        );


        await loadScrollCategories();


    } catch (error) {

        console.error(
            "Delete scroll category error:",
            error
        );


        alert(
            error.message ||
            "Unable to connect to server."
        );

    }

}


// =====================================================
// BEST SELLERS
// =====================================================

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


        const data =
            await parseResponse(
                response
            );


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to load products"
            );

        }


        const products =
            getProductsArray(data);


        select.innerHTML =
            `
                <option value="">
                    Select Product
                </option>
            `;


        products.forEach(
            product => {

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
                        Array.isArray(
                            product.images
                        ) &&
                        product.images.length
                            ? product.images[0]
                            : ""
                    );


                select.appendChild(
                    option
                );

            }
        );


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


// =====================================================
// LOAD BEST SELLERS
// =====================================================

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


        const data =
            await parseResponse(
                response
            );


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to load best sellers"
            );

        }


        allBestSellers =
            Array.isArray(data)
                ? data
                : Array.isArray(
                    data.bestSellers
                )
                    ? data.bestSellers
                    : [];


        renderBestSellers(
            allBestSellers
        );


    } catch (error) {

        console.error(
            "Best seller loading error:",
            error
        );


        container.innerHTML =
            "<p>Failed to load best sellers.</p>";

    }

}


// =====================================================
// RENDER BEST SELLERS
// =====================================================

function renderBestSellers(
    bestSellers
) {

    const container =
        document.getElementById(
            "bestSellersContainer"
        );


    if (!container) {
        return;
    }


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
                                    src="${escapeHTML(image)}"
                                    alt="${escapeHTML(
                                        item.name ||
                                        "Best Seller"
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
                                item.name ||
                                ""
                            )}
                        </h3>


                        <p>
                            Product ID:
                            ${escapeHTML(
                                item.productId ?? "-"
                            )}
                        </p>


                        <p>
                            Price:
                            ₹${Number(
                                item.price || 0
                            ).toFixed(2)}
                        </p>


                        <p>
                            Order:
                            ${escapeHTML(
                                item.order ?? 0
                            )}
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
                                type="button"
                                class="edit-btn"
                                onclick="editBestSeller('${escapeHTML(
                                    item._id || ""
                                )}')"
                            >
                                Edit
                            </button>


                            <button
                                type="button"
                                class="delete-btn"
                                onclick="deleteBestSeller('${escapeHTML(
                                    item._id || ""
                                )}')"
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
// ADD BEST SELLER
// =====================================================

function prepareAddBestSeller() {

    resetBestSellerForm();

    loadBestSellerProductOptions();

    showSectionById(
        "bestSellerSection"
    );

}


// =====================================================
// RESET BEST SELLER
// =====================================================

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


// =====================================================
// EDIT BEST SELLER
// =====================================================

async function editBestSeller(id) {

    const item =
        allBestSellers.find(
            seller =>
                seller._id === id
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
        item.price ?? 0;


    document.getElementById(
        "bestSellerOrder"
    ).value =
        item.order ?? 1;


    document.getElementById(
        "bestSellerActive"
    ).checked =
        item.active !== false;


    const preview =
        document.getElementById(
            "bestSellerImagePreview"
        );


    if (
        preview &&
        item.image
    ) {

        preview.innerHTML = `

            <p>Current Image:</p>

            <img
                src="${escapeHTML(
                    getImageUrl(
                        item.image
                    )
                )}"
                alt="${escapeHTML(
                    item.name ||
                    "Best Seller"
                )}"
            >

        `;

    }


    showSectionById(
        "bestSellerSection"
    );

}


// =====================================================
// SAVE BEST SELLER
// =====================================================

async function saveBestSeller(
    event
) {

    event.preventDefault();


    const editingId =
        document.getElementById(
            "editingBestSellerId"
        ).value;


    const select =
        document.getElementById(
            "bestSellerProduct"
        );


    if (
        !select ||
        !select.value
    ) {

        alert(
            "Please select a product."
        );

        return;

    }


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
        "order",
        document.getElementById(
            "bestSellerOrder"
        ).value
    );


    formData.append(
        "active",
        document.getElementById(
            "bestSellerActive"
        ).checked
            ? "true"
            : "false"
    );


    const imageInput =
        document.getElementById(
            "bestSellerImage"
        );


    if (
        imageInput &&
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
            await parseResponse(
                response
            );


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Best seller operation failed."
            );

        }


        message.textContent =
            editingId
                ? "Best seller updated successfully!"
                : "Best seller added successfully!";


        await loadBestSellers();


    } catch (error) {

        console.error(
            "Best seller save error:",
            error
        );


        message.style.color =
            "#b33";


        message.textContent =
            error.message ||
            "Unable to connect to server.";

    }

}


// =====================================================
// DELETE BEST SELLER
// =====================================================

async function deleteBestSeller(
    id
) {

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
                    headers:
                        authHeaders()
                }
            );


        const data =
            await parseResponse(
                response
            );


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to delete best seller."
            );

        }


        alert(
            "Best seller deleted successfully."
        );


        await loadBestSellers();


    } catch (error) {

        console.error(
            "Delete best seller error:",
            error
        );


        alert(
            error.message ||
            "Unable to connect to server."
        );

    }

}


// =====================================================
// STANDOUT
// =====================================================

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


        if (
            response.status === 404
        ) {

            currentStandout =
                null;


            container.innerHTML =
                "<p>No standout section configured yet.</p>";


            resetStandoutForm();


            return;

        }


        const data =
            await parseResponse(
                response
            );


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to load standout"
            );

        }


        currentStandout =
            data.standout ||
            data;


        const standout =
            currentStandout;


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


        const preview =
            document.getElementById(
                "standoutImagePreview"
            );


        if (preview) {

            preview.innerHTML =
                image
                    ? `

                        <p>Current Image:</p>

                        <img
                            src="${escapeHTML(image)}"
                            alt="${escapeHTML(
                                standout.title ||
                                "Standout"
                            )}"
                        >

                    `
                    : "";

        }


        container.innerHTML = `

            <div class="hero-card">

                ${
                    image
                        ? `

                            <img
                                src="${escapeHTML(image)}"
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
                            type="button"
                            class="edit-btn"
                            onclick="editStandout()"
                        >
                            Edit
                        </button>


                        <button
                            type="button"
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


// =====================================================
// EDIT STANDOUT
// =====================================================

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


// =====================================================
// RESET STANDOUT
// =====================================================

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


// =====================================================
// SAVE STANDOUT
// =====================================================

async function saveStandout(
    event
) {

    event.preventDefault();


    const editingId =
        document.getElementById(
            "editingStandoutId"
        ).value;


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
            ? "true"
            : "false"
    );


    const imageInput =
        document.getElementById(
            "standoutImage"
        );


    if (
        imageInput &&
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
            : "Adding standout...";


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
            await parseResponse(
                response
            );


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Standout operation failed."
            );

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


        message.style.color =
            "#b33";


        message.textContent =
            error.message ||
            "Unable to connect to server.";

    }

}


// =====================================================
// DELETE STANDOUT
// =====================================================

async function deleteStandout() {

    if (
        !currentStandout ||
        !currentStandout._id
    ) {

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
                    headers:
                        authHeaders()
                }
            );


        const data =
            await parseResponse(
                response
            );


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to delete standout."
            );

        }


        alert(
            "Standout section deleted successfully."
        );


        currentStandout =
            null;


        await loadStandout();


    } catch (error) {

        console.error(
            "Delete standout error:",
            error
        );


        alert(
            error.message ||
            "Unable to connect to server."
        );

    }

}


// =====================================================
// BEST SELLER PRODUCT SELECTION
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
                option.dataset.name ||
                "";

        }


        if (price) {

            price.value =
                option.dataset.price ||
                0;

        }


        if (
            preview &&
            option.dataset.image
        ) {

            preview.innerHTML = `

                <p>Product Image:</p>

                <img
                    src="${escapeHTML(
                        getImageUrl(
                            option.dataset.image
                        )
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
            previewMap[
                input.id
            ];


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


            image.alt =
                "Preview";


            image.style.width =
                input.id ===
                    "productImages"
                    ? "120px"
                    : "150px";


            image.style.height =
                input.id ===
                    "productImages"
                    ? "120px"
                    : "150px";


            image.style.objectFit =
                "cover";


            image.style.borderRadius =
                "8px";


            image.style.marginRight =
                "8px";


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