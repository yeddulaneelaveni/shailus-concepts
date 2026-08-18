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