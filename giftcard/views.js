function fixImagePath(path) {
    if (!path) return "";

    // Convert ../assets/... to assets/...
    if (path.startsWith("../assets/")) {
        return path.replace("../assets/", "assets/");
    }

    return path;
}
console.log("VIEWS.JS LOADED");
document.addEventListener("DOMContentLoaded", async () => {

    const API_URL = "http://localhost:5000/api/products";

    // Get product ID from URL
    const params = new URLSearchParams(window.location.search);
    const productId = params.get("id");

    if (!productId) {
        console.error("Product ID not found in URL");
        return;
    }

    try {
        // Fetch product
        const productResponse = await fetch(`${API_URL}/${productId}`);

        if (!productResponse.ok) {
            throw new Error("Product not found");
        }

        const product = await productResponse.json();

        console.log("Product loaded:", product);

        displayProduct(product);

        // Fetch similar products
        const similarResponse = await fetch(
            `${API_URL}/${productId}/similar`
        );

        if (similarResponse.ok) {
            const similarProducts = await similarResponse.json();

            console.log("Similar products:", similarProducts);

            displaySimilarProducts(similarProducts);
        }

    } catch (error) {
        console.error("Error loading product:", error);
    }
});


function displayProduct(product) {

    // -----------------------------
    // PAGE TITLE
    // -----------------------------

    document.title = `${product.name} – Shailu's Concepts`;


    // -----------------------------
    // BREADCRUMB
    // -----------------------------

    const breadcrumb = document.querySelector(".breadcrumb");

    if (breadcrumb) {
        breadcrumb.innerHTML = `
            <a href="index.html">Home</a>
            <span>›</span>
            <a href="#">${product.category}</a>
            <span>›</span>
            ${product.name}
        `;
    }


    // -----------------------------
    // PRODUCT DETAILS CONTAINER
    // -----------------------------

    const details = document.querySelector(".product-details");

    if (details) {

        details.dataset.id = product.productId;
        details.dataset.name = product.name;
        details.dataset.price = product.price;
        details.dataset.img = fixImagePath(product.image || product.images?.[0] || "");
    }


    // -----------------------------
    // PRODUCT NAME
    // -----------------------------

    const productTitle = document.querySelector(".product-details h1");

    if (productTitle) {
        productTitle.textContent = product.name;
    }


    // -----------------------------
    // SKU
    // -----------------------------

    const sku = document.querySelector(".product-details .sku");

    if (sku) {
        sku.textContent = `SKU: ${product.productId}`;
    }


    // -----------------------------
    // PRICE
    // -----------------------------

    const price = document.querySelector(".product-details .price");

    if (price) {

        if (product.price > 0) {
            price.textContent = `₹${Number(product.price).toFixed(2)}`;
        } else {
            price.textContent = "Price on request";
        }
    }


    // -----------------------------
    // MAIN IMAGE
    // -----------------------------

    const mainImg = document.getElementById("mainImg");

    const imageList =
    product.images && product.images.length > 0
        ? product.images.map(fixImagePath)
        : [fixImagePath(product.image)];

    if (mainImg && imageList[0]) {

        mainImg.src = imageList[0];
        mainImg.alt = product.name;
    }


    // -----------------------------
    // THUMBNAILS
    // -----------------------------

    const thumbRow = document.querySelector(".thumb-row");

    if (thumbRow) {

        thumbRow.innerHTML = "";

        imageList.forEach((image, index) => {

            if (!image) return;

            const thumb = document.createElement("div");

            thumb.className = index === 0
                ? "thumb active"
                : "thumb";

            thumb.onclick = function () {
                switchImg(this, image);
            };

            thumb.innerHTML = `
                <img
                    src="${image}"
                    alt="${product.name} image ${index + 1}"
                >
            `;

            thumbRow.appendChild(thumb);
        });
    }


    // -----------------------------
    // DESCRIPTION
    // -----------------------------

    let descriptionBox = document.getElementById("productDescription");

    if (!descriptionBox) {

        descriptionBox = document.createElement("div");

        descriptionBox.id = "productDescription";

        descriptionBox.className = "note-box";

        const specsTable = document.querySelector(".specs-table");

        if (specsTable) {
            specsTable.parentNode.insertBefore(
                descriptionBox,
                specsTable.nextSibling
            );
        }
    }

    descriptionBox.innerHTML = `
        <strong>Description:</strong>
        ${product.description || "No description available."}
    `;


    // -----------------------------
    // BADGE
    // -----------------------------

    if (product.badge) {

        const badge = document.createElement("div");

        badge.className = "product-badge";

        badge.textContent = product.badge;

        badge.style.cssText = `
            display: inline-block;
            width: fit-content;
            background: #c9a455;
            color: #0d3328;
            padding: 6px 12px;
            border-radius: 5px;
            font-size: 12px;
            font-weight: 700;
        `;

        const title = document.querySelector(".product-details h1");

        if (title) {
            title.insertAdjacentElement("afterend", badge);
        }
    }
}


function displaySimilarProducts(products) {

    const relatedGrid = document.querySelector(".related-grid");

    if (!relatedGrid) {
        return;
    }

    relatedGrid.innerHTML = "";

    if (products.length === 0) {

        relatedGrid.innerHTML = `
            <p style="grid-column:1/-1;text-align:center;">
                No related products found.
            </p>
        `;

        return;
    }


    products.slice(0, 4).forEach(product => {

        const image = fixImagePath(
                product.image ||
                (product.images && product.images.length > 0
                    ? product.images[0]
                    : "")
            );


        const card = document.createElement("div");

        card.className = "product-card";

        card.innerHTML = `
            <div class="img-wrap">
                <img
                    src="${image}"
                    alt="${product.name}"
                >
            </div>

            <div class="card-info">

                <h3>${product.name}</h3>

                <div class="card-price">
                    ₹${Number(product.price).toFixed(2)}
                </div>

                <button
                    class="view-btn"
                    onclick="window.location.href='views.html?id=${product.productId}'"
                >
                    View
                </button>

            </div>
        `;

        relatedGrid.appendChild(card);
    });
}

const API_URL = "http://localhost:5000";


// =====================================================
// IMAGE PATH
// =====================================================

function fixProductImage(path) {

    if (!path) {
        return "";
    }

    // Uploaded backend image
    if (path.startsWith("/uploads/")) {
        return API_URL + path;
    }

    // Old frontend image
    if (path.startsWith("../assets/")) {
        return path.replace("../assets/", "assets/");
    }

    return path;
}


// =====================================================
// GET PRODUCT ID FROM URL
// =====================================================

const params =
    new URLSearchParams(
        window.location.search
    );

const productId =
    params.get("id");


// =====================================================
// LOAD PRODUCT
// =====================================================

async function loadProductDetails() {

    if (!productId) {

        console.error(
            "Product ID missing from URL"
        );

        return;
    }


    try {

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
            "Product loaded:",
            product
        );


        displayProduct(product);


    } catch (error) {

        console.error(
            "Product loading error:",
            error
        );


        document.body.insertAdjacentHTML(
            "afterbegin",
            `
            <div style="
                padding:20px;
                text-align:center;
                background:#fff3cd;
                color:#664d03;
            ">
                Unable to load product.
            </div>
            `
        );

    }
}


// =====================================================
// DISPLAY PRODUCT
// =====================================================

function displayProduct(product) {

    // ==========================================
    // MAIN IMAGE
    // ==========================================

    const mainImage =
        fixProductImage(
            product.image ||
            (
                product.images &&
                product.images.length
                    ? product.images[0]
                    : ""
            )
        );


    const mainImg =
        document.getElementById(
            "mainImg"
        );


    if (mainImg && mainImage) {

        mainImg.src =
            mainImage;

        mainImg.alt =
            product.name;

    }


    // ==========================================
    // PRODUCT DETAILS CONTAINER
    // ==========================================

    const details =
        document.querySelector(
            ".product-details"
        );


    if (details) {

        details.dataset.id =
            product.productId;

        details.dataset.name =
            product.name;

        details.dataset.price =
            product.price;

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
            product.name;

    }


    // ==========================================
    // PRICE
    // ==========================================

    const price =
        document.querySelector(
            ".product-details .price"
        );


    if (price) {

        price.textContent =
            "₹" +
            Number(
                product.price
            ).toFixed(2);

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
            "SKU: " +
            product.productId;

    }


    // ==========================================
    // DESCRIPTION
    // ==========================================

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

            const description =
                document.createElement(
                    "div"
                );

            description.id =
                "productDescription";

            description.className =
                "note-box";

            description.style.marginBottom =
                "15px";


            description.innerHTML =
                `<strong>Description:</strong> ${escapeHTML(
                    product.description || ""
                )}`;


            noteBox.parentNode.insertBefore(
                description,
                noteBox
            );

        }

    } else {

        descriptionBox.innerHTML =
            `<strong>Description:</strong> ${escapeHTML(
                product.description || ""
            )}`;

    }


    // ==========================================
    // PRODUCT IMAGES / THUMBNAILS
    // ==========================================

    const thumbnailRow =
        document.querySelector(
            ".thumb-row"
        );


    if (thumbnailRow) {

        let imageList = [];


        if (product.image) {

            imageList.push(
                product.image
            );

        }


        if (
            product.images &&
            product.images.length
        ) {

            product.images.forEach(
                image => {

                    if (
                        !imageList.includes(
                            image
                        )
                    ) {

                        imageList.push(
                            image
                        );

                    }

                }
            );

        }


        thumbnailRow.innerHTML =
            "";


        imageList.forEach(
            (imagePath, index) => {

                const image =
                    fixProductImage(
                        imagePath
                    );


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
                        alt="${escapeHTML(product.name)}"
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


    // ==========================================
    // UPDATE SPECIFICATION TABLE
    // ==========================================

    updateSpecifications(
        product
    );

}


// =====================================================
// SPECIFICATIONS
// =====================================================

function updateSpecifications(product) {

    const cells =
        document.querySelectorAll(
            ".specs-table tbody td"
        );


    if (!cells.length) {
        return;
    }


    // Size / Inches
    if (cells[0]) {

        cells[0].textContent =
            product.dimensions ||
            "—";

    }


    // The remaining fields are not currently
    // present in your Product MongoDB schema.
    //
    // Keep existing static values for now.


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
// START
// =====================================================

loadProductDetails();