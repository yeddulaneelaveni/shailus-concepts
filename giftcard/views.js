// =====================================================
// VIEWS.JS
// Product Details + Category Based Related Products
// =====================================================

console.log("VIEWS.JS LOADED");


// =====================================================
// API CONFIGURATION
// =====================================================

const API_URL = "http://localhost:5000";


// =====================================================
// GET PRODUCT ID FROM URL
// =====================================================

const urlParams =
    new URLSearchParams(window.location.search);

const productId =
    urlParams.get("id");


// =====================================================
// IMAGE PATH HELPER
// =====================================================

function fixProductImage(path) {

    if (!path) {
        return "";
    }


    // ---------------------------------------------
    // Backend uploaded image
    // Example:
    // /uploads/products/image.jpg
    // ---------------------------------------------

    if (path.startsWith("/uploads/")) {

        return API_URL + path;

    }


    // ---------------------------------------------
    // Backend image without leading slash
    // ---------------------------------------------

    if (path.startsWith("uploads/")) {

        return API_URL + "/" + path;

    }


    // ---------------------------------------------
    // Old frontend paths
    // ---------------------------------------------

    if (path.startsWith("../assets/")) {

        return path.replace(
            "../assets/",
            "assets/"
        );

    }


    return path;
}


// =====================================================
// HTML ESCAPE
// =====================================================

function escapeHTML(value) {

    return String(value || "")

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );
}


// =====================================================
// LOAD PRODUCT DETAILS
// =====================================================

async function loadProductDetails() {

    if (!productId) {

        console.error(
            "Product ID missing from URL"
        );

        showProductError(
            "Product ID is missing."
        );

        return;
    }


    try {

        console.log(
            "Loading product:",
            productId
        );


        // ==========================================
        // GET CURRENT PRODUCT
        // ==========================================

        const response =
            await fetch(
                `${API_URL}/api/products/${productId}`
            );


        if (!response.ok) {

            throw new Error(
                "Product not found"
            );

        }


        const product =
            await response.json();


        console.log(
            "Current product:",
            product
        );


        // ==========================================
        // DISPLAY CURRENT PRODUCT
        // ==========================================

        displayProduct(product);


        // ==========================================
        // LOAD RELATED PRODUCTS
        // ==========================================

        await loadRelatedProducts(product);

    }
    catch (error) {

        console.error(
            "Product loading error:",
            error
        );


        showProductError(
            "Unable to load product."
        );

    }
}


// =====================================================
// DISPLAY PRODUCT
// =====================================================

function displayProduct(product) {

    // ==========================================
    // PAGE TITLE
    // ==========================================

    document.title =
        `${product.name} – Shailu's Concepts`;


    // ==========================================
    // BREADCRUMB
    // ==========================================

    const breadcrumb =
        document.querySelector(
            ".breadcrumb"
        );


    if (breadcrumb) {

        breadcrumb.innerHTML = `

            <a href="index.html">
                Home
            </a>

            <span>›</span>

            <a href="#">
                ${escapeHTML(
                    product.category || "Products"
                )}
            </a>

            <span>›</span>

            ${escapeHTML(product.name)}

        `;

    }


    // ==========================================
    // PRODUCT DETAILS CONTAINER
    // ==========================================

    const details =
        document.querySelector(
            ".product-details"
        );


    const mainImage =
        getMainProductImage(product);


    if (details) {

        details.dataset.id =
            product.productId;

        details.dataset.name =
            product.name || "";

        details.dataset.price =
            product.price || 0;

        details.dataset.img =
            mainImage;

    }


    // ==========================================
    // PRODUCT NAME
    // ==========================================

    const title =
        document.querySelector(
            ".product-details h1"
        );


    if (title) {

        title.textContent =
            product.name || "";

    }


    // ==========================================
    // SKU
    // ==========================================

    const sku =
        document.querySelector(
            ".product-details .sku"
        );


    if (sku) {

        sku.textContent =
            `SKU: ${product.productId}`;

    }


    // ==========================================
    // PRICE
    // ==========================================

    const price =
        document.querySelector(
            ".product-details .price"
        );


    if (price) {

        const productPrice =
            Number(product.price || 0);


        if (productPrice > 0) {

            price.textContent =
                `₹${productPrice.toFixed(2)}`;

        }
        else {

            price.textContent =
                "Price on request";

        }

    }


    // ==========================================
    // MAIN IMAGE
    // ==========================================

    const mainImg =
        document.getElementById(
            "mainImg"
        );


    if (mainImg) {

        if (mainImage) {

            mainImg.src =
                mainImage;

            mainImg.alt =
                product.name || "Product";

        }

        else {

            mainImg.src =
                "https://placehold.co/600x600/f7f3ea/0d3328?text=No+Image";

        }

    }


    // ==========================================
    // PRODUCT THUMBNAILS
    // ==========================================

    displayProductImages(product);


    // ==========================================
    // DESCRIPTION
    // ==========================================

    displayDescription(product);


    // ==========================================
    // BADGE
    // ==========================================

    displayBadge(product);


    // ==========================================
    // SPECIFICATIONS
    // ==========================================

    updateSpecifications(product);

}


// =====================================================
// GET PRODUCT IMAGES
// =====================================================

function getProductImages(product) {

    const imageList = [];


    // ---------------------------------------------
    // Main image
    // ---------------------------------------------

    if (product.image) {

        imageList.push(
            product.image
        );

    }


    // ---------------------------------------------
    // Additional images
    // ---------------------------------------------

    if (
        product.images &&
        Array.isArray(product.images)
    ) {

        product.images.forEach(
            image => {

                if (
                    image &&
                    !imageList.includes(image)
                ) {

                    imageList.push(image);

                }

            }
        );

    }


    return imageList
        .map(fixProductImage)
        .filter(Boolean);
}


// =====================================================
// GET MAIN IMAGE
// =====================================================

function getMainProductImage(product) {

    const images =
        getProductImages(product);


    if (images.length > 0) {

        return images[0];

    }


    return "";

}


// =====================================================
// DISPLAY PRODUCT IMAGES
// =====================================================

function displayProductImages(product) {

    const thumbnailRow =
        document.querySelector(
            ".thumb-row"
        );


    if (!thumbnailRow) {
        return;
    }


    const images =
        getProductImages(product);


    thumbnailRow.innerHTML = "";


    if (images.length === 0) {

        return;

    }


    images.forEach(
        (image, index) => {

            const thumb =
                document.createElement(
                    "div"
                );


            thumb.className =
                index === 0
                    ? "thumb active"
                    : "thumb";


            thumb.innerHTML = `

                <img
                    src="${image}"
                    alt="${escapeHTML(
                        product.name
                    )} image ${index + 1}"
                    onerror="
                        this.src='https://placehold.co/80x80/f7f3ea/0d3328?text=Image'
                    "
                >

            `;


            thumb.onclick =
                function () {

                    switchImg(
                        thumb,
                        image
                    );

                };


            thumbnailRow.appendChild(
                thumb
            );

        }
    );

}


// =====================================================
// DISPLAY DESCRIPTION
// =====================================================

function displayDescription(product) {

    let descriptionBox =
        document.getElementById(
            "productDescription"
        );


    if (!descriptionBox) {

        const noteBox =
            document.querySelector(
                ".note-box"
            );


        if (noteBox) {

            descriptionBox =
                document.createElement(
                    "div"
                );


            descriptionBox.id =
                "productDescription";


            descriptionBox.className =
                "note-box";


            descriptionBox.style.marginBottom =
                "15px";


            noteBox.parentNode.insertBefore(
                descriptionBox,
                noteBox
            );

        }

    }


    if (descriptionBox) {

        descriptionBox.innerHTML = `

            <strong>
                Description:
            </strong>

            ${escapeHTML(
                product.description ||
                "No description available."
            )}

        `;

    }

}


// =====================================================
// DISPLAY BADGE
// =====================================================

function displayBadge(product) {

    // Remove previous badge first
    const oldBadge =
        document.querySelector(
            ".product-badge"
        );


    if (oldBadge) {

        oldBadge.remove();

    }


    if (!product.badge) {

        return;

    }


    const badge =
        document.createElement(
            "div"
        );


    badge.className =
        "product-badge";


    badge.textContent =
        product.badge;


    badge.style.cssText = `

        display: inline-block;

        width: fit-content;

        background: #c9a455;

        color: #0d3328;

        padding: 6px 12px;

        border-radius: 5px;

        font-size: 12px;

        font-weight: 700;

        margin-bottom: 5px;

    `;


    const title =
        document.querySelector(
            ".product-details h1"
        );


    if (title) {

        title.insertAdjacentElement(
            "afterend",
            badge
        );

    }

}


// =====================================================
// UPDATE SPECIFICATIONS
// =====================================================

function updateSpecifications(product) {

    const cells =
        document.querySelectorAll(
            ".specs-table tbody td"
        );


    if (!cells.length) {

        return;

    }


    // ==========================================
    // SIZE / DIMENSIONS
    // ==========================================

    if (cells[0]) {

        cells[0].textContent =
            product.dimensions ||
            "—";

    }


    // ==========================================
    // CATEGORY
    // ==========================================

    if (cells[1]) {

        cells[1].textContent =
            product.category ||
            "—";

    }


    // ==========================================
    // BADGE / TYPE
    // ==========================================

    if (cells[2]) {

        cells[2].textContent =
            product.badge ||
            "—";

    }


    // ==========================================
    // MATERIAL
    // ==========================================
    // Your current Product schema does not
    // contain a material field.
    // So leave this as existing/static value.
    // ==========================================


    // ==========================================
    // MOQ
    // ==========================================
    // Your current Product schema does not
    // contain MOQ.
    // ==========================================


    // ==========================================
    // CUSTOMIZATION
    // ==========================================
    // Your current Product schema does not
    // contain customization.
    // ==========================================

}


// =====================================================
// LOAD RELATED PRODUCTS
// =====================================================

async function loadRelatedProducts(
    currentProduct
) {

    const relatedGrid =
        document.querySelector(
            ".related-grid"
        );


    if (!relatedGrid) {

        console.warn(
            "Related products container not found"
        );

        return;

    }


    try {

        // ==========================================
        // GET ALL PRODUCTS
        // ==========================================

        const response =
            await fetch(
                `${API_URL}/api/products`
            );


        if (!response.ok) {

            throw new Error(
                "Unable to load products"
            );

        }


        const products =
            await response.json();


        console.log(
            "All products:",
            products
        );


        // ==========================================
        // CHECK CATEGORY
        // ==========================================

        if (!currentProduct.category) {

            console.warn(
                "Current product has no category"
            );


            displaySimilarProducts([]);

            return;

        }


        // ==========================================
        // FILTER SAME CATEGORY
        // ==========================================

        const currentCategory =
            String(
                currentProduct.category
            )
                .trim()
                .toLowerCase();


        const currentId =
            String(
                currentProduct.productId
            );


        const relatedProducts =
            products.filter(
                product => {

                    const productCategory =
                        String(
                            product.category || ""
                        )
                            .trim()
                            .toLowerCase();


                    const productId =
                        String(
                            product.productId
                        );


                    return (

                        // Same category
                        productCategory ===
                        currentCategory

                        &&

                        // Don't show current product
                        productId !==
                        currentId

                    );

                }
            );


        console.log(
            "Current category:",
            currentProduct.category
        );


        console.log(
            "Related products:",
            relatedProducts
        );


        // ==========================================
        // SHOW MAXIMUM 4
        // ==========================================

        displaySimilarProducts(
            relatedProducts.slice(0, 4)
        );

    }
    catch (error) {

        console.error(
            "Related products error:",
            error
        );


        relatedGrid.innerHTML = `

            <p style="
                grid-column:1/-1;
                text-align:center;
                color:#777;
            ">

                Unable to load related products.

            </p>

        `;

    }

}


// =====================================================
// DISPLAY RELATED PRODUCTS
// =====================================================

function displaySimilarProducts(
    products
) {

    const relatedGrid =
        document.querySelector(
            ".related-grid"
        );


    if (!relatedGrid) {

        return;

    }


    relatedGrid.innerHTML = "";


    // ==========================================
    // NO RELATED PRODUCTS
    // ==========================================

    if (
        !products ||
        products.length === 0
    ) {

        relatedGrid.innerHTML = `

            <p style="
                grid-column:1/-1;
                text-align:center;
                color:#777;
            ">

                No related products found.

            </p>

        `;

        return;

    }


    // ==========================================
    // CREATE PRODUCT CARDS
    // ==========================================

    products
        .slice(0, 4)
        .forEach(
            product => {

                const image =
                    fixProductImage(
                        product.image ||
                        (
                            product.images &&
                            product.images.length > 0
                                ? product.images[0]
                                : ""
                        )
                    );


                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "product-card";


                const productName =
                    escapeHTML(
                        product.name ||
                        "Product"
                    );


                const productPrice =
                    Number(
                        product.price || 0
                    );


                const productImage =
                    image ||
                    "https://placehold.co/300x300/f7f3ea/0d3328?text=No+Image";


                card.innerHTML = `

                    <div class="img-wrap">

                        <img
                            src="${productImage}"
                            alt="${productName}"
                            onerror="
                                this.src='https://placehold.co/300x300/f7f3ea/0d3328?text=No+Image'
                            "
                        >

                    </div>


                    <div class="card-info">

                        <h3>
                            ${productName}
                        </h3>


                        <div class="card-price">

                            ₹${productPrice.toFixed(2)}

                        </div>


                        <button
                            class="view-btn"
                            type="button"
                            data-product-id="${product.productId}"
                        >
                            View
                        </button>

                    </div>

                `;


                // ==========================================
                // VIEW BUTTON
                // ==========================================

                const viewButton =
                    card.querySelector(
                        ".view-btn"
                    );


                if (viewButton) {

                    viewButton.addEventListener(
                        "click",
                        function () {

                            window.location.href =
                                `views.html?id=${product.productId}`;

                        }
                    );

                }


                relatedGrid.appendChild(
                    card
                );

            }
        );

}


// =====================================================
// SHOW PRODUCT ERROR
// =====================================================

function showProductError(
    message
) {

    const productSection =
        document.querySelector(
            ".product-section"
        );


    if (productSection) {

        productSection.innerHTML = `

            <div style="
                grid-column:1/-1;
                text-align:center;
                padding:60px 20px;
                color:#777;
            ">

                <h2>
                    ${escapeHTML(message)}
                </h2>

                <p style="margin-top:10px;">
                    Please try again.
                </p>

                <a
                    href="index.html"
                    style="
                        display:inline-block;
                        margin-top:20px;
                        padding:12px 24px;
                        background:#0d3328;
                        color:#e6cf8f;
                        text-decoration:none;
                        border-radius:6px;
                    "
                >
                    Back to Home
                </a>

            </div>

        `;

    }

}


// =====================================================
// START
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadProductDetails();

    }
);