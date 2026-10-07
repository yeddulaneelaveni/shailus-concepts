(() => {
    // ===== KONDApALLI SHOWCASE =====
    // Replace this single image path for the independent left-side showcase image.
    const kondapalliMainShowcaseImage = "assets/kbwholesome.png";
    const productUploadPath = `${window.API_BASE_URL}/uploads/products/`;

    // Products on the right use the existing cart and detail-page behavior.
    const kondapalliProducts = [
        {
            id: 32,
            image: `${productUploadPath}1791200652636-758154286.png`,
            name: "Hand-Painted Kondapalli Wooden Decorative Pot",
            price: 200
        },
        {
            id: 29,
            image: `${productUploadPath}1791180281392-448004405.png`,
            name: "Colorful Buddha Meditation Figurine Set",
            price: 300
        },
        {
            id: 30,
            image: `${productUploadPath}1791200117202-875871987.png`,
            name: "Traditional Kondapalli Bommalu Couple Pen Stand",
            price: 200
        }
    ];

    const section = document.getElementById("kondapalliShowcase");
    if (!section) return;

    const mainImage = section.querySelector("#kondapalliMainImage");
    const rightImage = section.querySelector("#kondapalliRightImage");
    const currentProduct = section.querySelector("#kondapalliCurrentProduct");
    const viewMoreLink = section.querySelector("#kondapalliViewMore");
    const productName = section.querySelector("#kondapalliProductName");
    const productPrice = section.querySelector("#kondapalliProductPrice");
    const dotNavigation = section.querySelector("#kondapalliDots");
    if (!mainImage || !rightImage || !currentProduct || !viewMoreLink || !productName || !productPrice || !dotNavigation) return;

    let activeIndex = 0;
    let autoplayTimer = null;
    let imageSwapTimer = null;
    let autoplayPaused = false;

    function escapeHtml(value) {
        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    mainImage.alt = "Kondapalli Bommalu showcase";
    mainImage.onload = () => { mainImage.hidden = false; };
    mainImage.onerror = () => { mainImage.hidden = true; };
    mainImage.src = kondapalliMainShowcaseImage;

    rightImage.onload = () => rightImage.classList.remove("is-switching");
    rightImage.onerror = () => {
        rightImage.hidden = true;
        rightImage.classList.remove("is-switching");
    };

    function updateSelectedProduct(index, manual = true) {
        activeIndex = (index + kondapalliProducts.length) % kondapalliProducts.length;
        const product = kondapalliProducts[activeIndex];

        clearTimeout(imageSwapTimer);
        rightImage.classList.add("is-switching");
        imageSwapTimer = setTimeout(() => {
            rightImage.hidden = false;
            rightImage.alt = product.name;
            rightImage.src = product.image;
        }, 250);

        currentProduct.dataset.id = String(product.id);
        currentProduct.dataset.name = product.name;
        currentProduct.dataset.price = String(product.price);
        currentProduct.dataset.img = product.image;
        viewMoreLink.href = `views.html?id=${encodeURIComponent(product.id)}`;
        productName.textContent = product.name;
        productPrice.textContent = `₹${Number(product.price).toFixed(2)}`;

        dotNavigation.querySelectorAll(".kondapalli-dot").forEach((dot, dotIndex) => {
            const selected = dotIndex === activeIndex;
            dot.classList.toggle("is-active", selected);
            dot.setAttribute("aria-pressed", String(selected));
        });

        if (manual) resetAutoplay();
    }

    function resetAutoplay() {
        clearInterval(autoplayTimer);
        autoplayTimer = null;
        if (!autoplayPaused) {
            autoplayTimer = setInterval(() => updateSelectedProduct(activeIndex + 1, false), 5000);
        }
    }

    dotNavigation.innerHTML = kondapalliProducts.map((product, index) => `
        <button
            class="kondapalli-dot${index === 0 ? " is-active" : ""}"
            type="button"
            aria-label="Show product ${index + 1}"
            aria-pressed="${index === 0}"
            title="${escapeHtml(product.name)}"
        ></button>
    `).join("");

    dotNavigation.querySelectorAll(".kondapalli-dot").forEach((dot, index) => {
        dot.addEventListener("click", () => updateSelectedProduct(index));
    });

    currentProduct.addEventListener("mouseenter", () => {
        autoplayPaused = true;
        clearInterval(autoplayTimer);
    });
    currentProduct.addEventListener("mouseleave", () => {
        autoplayPaused = false;
        resetAutoplay();
    });
    section.addEventListener("keydown", event => {
        if (event.key === "ArrowLeft") {
            event.preventDefault();
            updateSelectedProduct(activeIndex - 1);
        } else if (event.key === "ArrowRight") {
            event.preventDefault();
            updateSelectedProduct(activeIndex + 1);
        }
    });

    updateSelectedProduct(0, false);
    resetAutoplay();
})();
