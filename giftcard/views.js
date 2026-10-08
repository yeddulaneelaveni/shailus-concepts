// =====================================================
// VIEWS.JS
// Product Details + Category Based Related Products
// =====================================================

console.log("VIEWS.JS LOADED");

// =====================================================
// API CONFIGURATION
// =====================================================

const API_URL = window.API_BASE_URL;

// =====================================================
// GET PRODUCT ID FROM URL
// Example: views.html?id=123
// =====================================================

const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get("id");

// =====================================================
// IMAGE PATH HELPER
// =====================================================

function fixProductImage(path) {
    return window.resolveStoreImageUrl(path);
}

// =====================================================
// HTML ESCAPE
// =====================================================

function escapeHTML(value) {

    return String(value || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

// =====================================================
// LOAD PRODUCT DETAILS
// =====================================================

async function loadProductDetails() {

    if (!productId) {

        console.error("Product ID missing from URL");

        showProductError("Product ID is missing.");

        return;
    }

    try {

        console.log("Loading product:", productId);

        // =================================================
        // GET PRODUCT FROM BACKEND
        // =================================================

        const response = await fetch(
            `${API_URL}/api/products/${productId}`
        );

        if (!response.ok) {
            throw new Error("Product not found");
        }

        const product = await response.json();

        console.log("Current product:", product);

        // =================================================
        // DISPLAY PRODUCT
        // =================================================

        displayProduct(product);

        // =================================================
        // LOAD RELATED PRODUCTS
        // =================================================

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

    // =================================================
    // MAIN IMAGE
    // =================================================

    const productImages = getProductImages(product);
    const mainImage = productImages[0] || "";

    const mainImg =
        document.getElementById("mainImg");

    if (mainImg) {
        const mainImageWrap = mainImg.closest(".main-img-wrap");
        mainImg.onerror = function () {
            const failedImage = mainImg.currentSrc || mainImg.src;
            const failedThumb = Array.from(
                document.querySelectorAll(".thumb-row .thumb")
            ).find(thumb => thumb.querySelector("img")?.src === failedImage);
            if (failedThumb) failedThumb.remove();

            const fallbackThumb = document.querySelector(".thumb-row .thumb");
            if (fallbackThumb) {
                switchImg(
                    fallbackThumb,
                    fallbackThumb.querySelector("img").src
                );
                return;
            }

            if (mainImageWrap) mainImageWrap.hidden = true;
            mainImg.removeAttribute("src");
        };

        if (mainImage) {
            if (mainImageWrap) mainImageWrap.hidden = false;
            mainImg.src = mainImage;
            mainImg.alt = product.name || "Product";
        } else {
            if (mainImageWrap) mainImageWrap.hidden = true;
            mainImg.removeAttribute("src");
        }
    }

    // =================================================
    // PRODUCT DETAILS CONTAINER
    // =================================================

    const details =
        document.querySelector(
            ".product-details"
        );

    if (details) {

        details.dataset.id =
            product.productId || "";

        details.dataset.name =
            product.name || "";

        details.dataset.price =
            product.price || "";

        details.dataset.img = mainImage;
    }

    // =================================================
    // PRODUCT NAME
    // =================================================

    const title =
        document.querySelector(
            ".product-details h1"
        );

    if (title) {

        title.textContent =
            product.name || "-";
    }

    // =================================================
    // SKU
    // =================================================

    const sku =
        document.querySelector(
            ".product-details .sku"
        );

    if (sku) {

        sku.textContent =
            "SKU: " +
            (product.productId ?? "-");
    }

    // =================================================
    // PRICE
    // =================================================

    const price =
        document.querySelector(
            ".product-details .price"
        );

    if (price) {

        if (
            product.price !== undefined &&
            product.price !== null &&
            product.price !== ""
        ) {

            price.textContent =
                "₹" +
                Number(product.price).toFixed(2);

        }
        else {

            price.textContent =
                "Price on request";
        }
    }

    // =================================================
    // SPECIFICATION TABLE
    // =================================================

    updateSpecifications(product);

    // =================================================
    // DESCRIPTION
    // =================================================

    displayDescription(product);

    // =================================================
    // BADGE
    // =================================================

    displayBadge(product);

    // =================================================
    // PRODUCT IMAGES / THUMBNAILS
    // =================================================

    displayProductImages(product);
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

    // Size / Dimensions
    if (cells[0]) {

        cells[0].textContent =
            product.dimensions || "-";
    }

    // Shape
    if (cells[1]) {

        cells[1].textContent =
            product.shape || "-";
    }

    // Colour
    if (cells[2]) {

        cells[2].textContent =
            product.colour || "-";
    }

    // Material
    if (cells[3]) {

        cells[3].textContent =
            product.material || "-";
    }

    // MOQ
    if (cells[4]) {

        cells[4].textContent =
            product.moq || "-";
    }

    // Customization
    if (cells[5]) {

        cells[5].textContent =
            product.customization || "-";
    }
}

// =====================================================
// DISPLAY DESCRIPTION
// =====================================================

function displayDescription(product) {

    let descriptionBox =
        document.getElementById(
            "productDescription"
        );

    // Create description box if it doesn't exist
    if (!descriptionBox) {

        descriptionBox =
            document.createElement("div");

        descriptionBox.id =
            "productDescription";

        descriptionBox.className =
            "note-box";

        const specsTable =
            document.querySelector(
                ".specs-table"
            );

        if (specsTable) {

            specsTable.parentNode.insertBefore(
                descriptionBox,
                specsTable.nextSibling
            );
        }
    }

    if (descriptionBox) {

        descriptionBox.innerHTML =
            `<strong>Description:</strong> ${
                escapeHTML(
                    product.description ||
                    "No description available."
                )
            }`;
    }
}

// =====================================================
// DISPLAY BADGE
// =====================================================

function displayBadge(product) {

    // Remove previous badge
    const oldBadge =
        document.querySelector(
            ".product-details .product-badge"
        );

    if (oldBadge) {
        oldBadge.remove();
    }

    // No badge
    if (!product.badge) {
        return;
    }

    // Create badge
    const badge =
        document.createElement("div");

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
        margin: 10px 0;
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
// GET PRODUCT IMAGES
// =====================================================

function getProductImages(product) {
    const imagePaths = [
        product?.image,
        ...(Array.isArray(product?.images) ? product.images : [])
    ]
        .filter(image => typeof image === "string")
        .map(image => image.trim())
        .filter(Boolean);

    return [...new Set(imagePaths.map(fixProductImage).filter(Boolean))];
}

// =====================================================
// GET MAIN PRODUCT IMAGE
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
                    "button"
                );

            thumb.type = "button";
            thumb.className =
                index === 0
                    ? "thumb active"
                    : "thumb";
            thumb.setAttribute(
                "aria-label",
                `Show image ${index + 1} of ${product.name || "product"}`
            );
            thumb.setAttribute(
                "aria-pressed",
                index === 0 ? "true" : "false"
            );

            const thumbnailImage = document.createElement("img");
            thumbnailImage.src = image;
            thumbnailImage.alt = `${product.name || "Product"} image ${index + 1}`;
            thumbnailImage.onerror = function () {
                thumb.remove();
            };
            thumb.appendChild(thumbnailImage);

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

function switchImg(thumb, image) {

    const mainImg =
        document.getElementById("mainImg");

    if (!mainImg || !image) {
        return;
    }

    mainImg.src = image;
    const mainImageWrap = mainImg.closest(".main-img-wrap");
    if (mainImageWrap) mainImageWrap.hidden = false;

    document.querySelectorAll(".thumb-row .thumb").forEach(
        item => {
            const isActive = item === thumb;
            item.classList.toggle("active", isActive);
            item.setAttribute(
                "aria-pressed",
                isActive ? "true" : "false"
            );
        }
    );

    const productDetails =
        document.querySelector(".product-details");

    if (productDetails) {
        productDetails.dataset.img = image;
    }
}

function openZoom() {

    const dialog =
        document.getElementById("imageZoomDialog");

    const mainImg =
        document.getElementById("mainImg");

    const zoomedImg =
        document.getElementById("zoomedImg");

    if (!dialog || !mainImg || !mainImg.src || !zoomedImg) {
        return;
    }

    zoomedImg.src = mainImg.src;
    zoomedImg.alt = mainImg.alt || "Zoomed product image";

    if (!dialog.open) {
        dialog.showModal();
    }
}

function closeZoom() {

    const dialog =
        document.getElementById("imageZoomDialog");

    if (dialog && dialog.open) {
        dialog.close();
    }
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
        const response = await fetch(
            `${API_URL}/api/products/${currentProduct.productId}/related`
        );

        if (!response.ok) {
            throw new Error("Unable to load related products");
        }

        const payload = await response.json();
        const relatedProducts = Array.isArray(payload.products)
            ? payload.products
            : [];

        displaySimilarProducts(
            relatedProducts,
            payload.message || currentProduct.relatedProductsMessage || "Explore more gifts from Shailu's Concepts"
        );
    }
    catch (error) {

        console.error(
            "Related products error:",
            error
        );

        displaySimilarProducts([], "Explore more gifts from Shailu's Concepts");
    }
}

// =====================================================
// DISPLAY RELATED PRODUCTS
// =====================================================

function displaySimilarProducts(
    products,
    emptyMessage = "Explore more gifts from Shailu's Concepts"
) {

    const relatedGrid =
        document.querySelector(
            ".related-grid"
        );

    if (!relatedGrid) {
        return;
    }

    relatedGrid.innerHTML = "";

    if (
        !products ||
        products.length === 0
    ) {
        relatedGrid.innerHTML = `
            <p class="related-empty-message">
                ${escapeHTML(emptyMessage)}
            </p>
        `;
        return;
    }

    // =================================================
    // SHOW RELATED PRODUCTS
    // =================================================

    products
        .slice(0, 4)
        .forEach(
            product => {

                const images = getProductImages(product);
                const image = images[0] || "";

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

                card.innerHTML = `
                    ${image ? `
                        <div class="img-wrap">
                            <img src="${escapeHTML(image)}" alt="${productName}">
                        </div>
                    ` : ""}

                    <div class="card-info">

                        ${product.badge ? `<div class="product-badge">${escapeHTML(product.badge)}</div>` : ""}

                        <h3>
                            ${productName}
                        </h3>

                        <div class="card-price">
                            ${
                                product.price !== undefined &&
                                product.price !== null &&
                                product.price !== ""
                                    ? "₹" +
                                      productPrice.toFixed(2)
                                    : "Price on request"
                            }
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

                const relatedImage = card.querySelector(".img-wrap img");
                if (relatedImage) {
                    let nextImageIndex = 1;
                    relatedImage.onerror = function () {
                        if (nextImageIndex < images.length) {
                            relatedImage.src = images[nextImageIndex];
                            nextImageIndex += 1;
                        } else {
                            relatedImage.closest(".img-wrap").remove();
                        }
                    };
                }

                // =================================================
                // VIEW BUTTON
                // =================================================

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

    if (!productSection) {
        return;
    }

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

// =====================================================
// START
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const zoomDialog =
            document.getElementById("imageZoomDialog");

        if (zoomDialog) {
            zoomDialog.addEventListener(
                "click",
                event => {
                    if (event.target === zoomDialog) {
                        closeZoom();
                    }
                }
            );
        }

        loadProductDetails();

    }
);