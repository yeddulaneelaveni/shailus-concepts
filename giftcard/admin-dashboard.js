// =====================================================
// ADMIN DASHBOARD JAVASCRIPT
// =====================================================

const API_URL = window.API_BASE_URL;


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

    const token = localStorage.getItem("adminToken") || "";

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

// ==============================
// ORDERS
// ==============================

async function loadOrders() {

    const container =
        document.querySelector(".orders-container");

    if (!container) {
        console.error("Orders container not found");
        return;
    }

    container.innerHTML = `
        <div style="
            padding:40px;
            text-align:center;
            color:#777;
        ">
            Loading orders...
        </div>
    `;

    try {

        const response = await fetch(
            `${API_URL}/api/orders`,
            {
                headers: authHeaders()
            }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(
                data.message || "Unable to load orders"
            );
        }

        const orders = data.orders || [];

        if (orders.length === 0) {

            container.innerHTML = `
                <div style="
                    background:#fff;
                    padding:50px;
                    text-align:center;
                    border-radius:14px;
                    border:1px solid #e5dfd4;
                ">
                    <h2 style="
                        color:#073F32;
                        font-family:Georgia,serif;
                    ">
                        No Orders Yet
                    </h2>

                    <p style="color:#777;">
                        Customer orders will appear here.
                    </p>
                </div>
            `;

            return;
        }


        // ==============================
        // ORDER TABLE
        // ==============================

        let rows = "";

        orders.forEach(function(order) {

            const paymentClass =
                order.paymentStatus === "Paid"
                    ? "paid"
                    : "pending";

            const date =
                order.createdAt
                    ? new Date(
                        order.createdAt
                    ).toLocaleString("en-IN")
                    : "-";

            rows += `
                <tr>

                    <td>
                        <strong>
                            ${escapeOrderHTML(
                                order.orderId
                            )}
                        </strong>
                    </td>

                    <td>
                        ${escapeOrderHTML(
                            order.customerName
                        )}
                    </td>

                    <td>
                        ${escapeOrderHTML(
                            order.phone
                        )}
                    </td>

                    <td>
                        <strong>
                            ₹${Number(
                                order.totalAmount || 0
                            ).toFixed(2)}
                        </strong>
                    </td>

                    <td>
                        <span class="
                            order-payment
                            ${paymentClass}
                        ">
                            ${escapeOrderHTML(
                                order.paymentStatus
                            )}
                        </span>
                    </td>

                    <td>
                        <span class="
                            order-status
                        ">
                            ${escapeOrderHTML(
                                order.orderStatus
                            )}
                        </span>
                    </td>

                    <td>
                        ${escapeOrderHTML(date)}
                    </td>

                    <td>

                        <button
                            class="order-view-btn"
                            onclick="viewOrder('${encodeURIComponent(
                                order.orderId
                            )}')">

                            View

                        </button>

                    </td>

                </tr>
            `;
        });


        container.innerHTML = `

            <div class="orders-summary">

                <div class="order-stat-card">

                    <span>Total Orders</span>

                    <strong>
                        ${orders.length}
                    </strong>

                </div>


                <div class="order-stat-card">

                    <span>Paid Orders</span>

                    <strong>
                        ${
                            orders.filter(
                                o =>
                                    o.paymentStatus === "Paid"
                            ).length
                        }
                    </strong>

                </div>


                <div class="order-stat-card">

                    <span>Processing</span>

                    <strong>
                        ${
                            orders.filter(
                                o =>
                                    o.orderStatus ===
                                    "Processing"
                            ).length
                        }
                    </strong>

                </div>


                <div class="order-stat-card">

                    <span>Delivered</span>

                    <strong>
                        ${
                            orders.filter(
                                o =>
                                    o.orderStatus ===
                                    "Delivered"
                            ).length
                        }
                    </strong>

                </div>

            </div>


            <div class="orders-table-card">

                <div class="orders-table-wrapper">

                    <table class="orders-table">

                        <thead>

                            <tr>

                                <th>Order ID</th>

                                <th>Customer</th>

                                <th>Phone</th>

                                <th>Total</th>

                                <th>Payment</th>

                                <th>Status</th>

                                <th>Date</th>

                                <th>Action</th>

                            </tr>

                        </thead>

                        <tbody>

                            ${rows}

                        </tbody>

                    </table>

                </div>

            </div>

        `;


        addOrdersStyles();


    } catch (error) {

        console.error(
            "Orders loading error:",
            error
        );

        container.innerHTML = `

            <div style="
                background:#fff;
                padding:40px;
                border-radius:14px;
                border:1px solid #e5dfd4;
                color:#a33;
            ">

                <h3>
                    Unable to load orders
                </h3>

                <p>
                    ${escapeOrderHTML(
                        error.message
                    )}
                </p>

            </div>

        `;
    }
}


// ==============================
// VIEW ORDER
// ==============================

async function viewOrder(orderId) {

    try {

        const response = await fetch(
            `${API_URL}/api/orders/` +
            decodeURIComponent(orderId),
            {
                headers: authHeaders()
            }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(
                data.message ||
                "Unable to load order"
            );
        }

        const order = data.order;

        const address =
            order.shippingAddress || {};

        const items =
            order.items || [];


        let itemsHTML = "";

        items.forEach(function(item) {

            itemsHTML += `

                <div class="order-item-row">

                    <div>

                        <strong>
                            ${escapeOrderHTML(
                                item.name
                            )}
                        </strong>

                        <div>
                            Quantity:
                            ${Number(
                                item.quantity || 0
                            )}
                        </div>

                    </div>

                    <strong>
                        ₹${Number(
                            item.finalPrice || 0
                        ).toFixed(2)}
                    </strong>

                </div>

            `;

        });


        const modal = document.createElement("div");

        modal.className =
            "order-details-overlay";


        modal.innerHTML = `

            <div class="order-details-modal">

                <div class="order-details-header">

                    <div>

                        <small>
                            ORDER
                        </small>

                        <h2>
                            ${escapeOrderHTML(
                                order.orderId
                            )}
                        </h2>

                    </div>

                    <button
                        class="order-close-btn">

                        ×

                    </button>

                </div>


                <div class="order-details-grid">


                    <!-- CUSTOMER -->

                    <div class="order-detail-card">

                        <h3>
                            👤 Customer
                        </h3>

                        <p>
                            <strong>
                                Name:
                            </strong>

                            ${escapeOrderHTML(
                                order.customerName
                            )}
                        </p>

                        <p>
                            <strong>
                                Phone:
                            </strong>

                            ${escapeOrderHTML(
                                order.phone
                            )}
                        </p>

                        <p>
                            <strong>
                                Email:
                            </strong>

                            ${escapeOrderHTML(
                                order.email || "-"
                            )}
                        </p>

                    </div>


                    <!-- PAYMENT -->

                    <div class="order-detail-card">

                        <h3>
                            💳 Payment
                        </h3>

                        <p>

                            <strong>
                                Status:
                            </strong>

                            ${escapeOrderHTML(
                                order.paymentStatus
                            )}

                        </p>

                        <p>

                            <strong>
                                Payment ID:
                            </strong>

                            ${escapeOrderHTML(
                                order.razorpayPaymentId
                            )}

                        </p>

                        <p>

                            <strong>
                                Razorpay Order:
                            </strong>

                            ${escapeOrderHTML(
                                order.razorpayOrderId
                            )}

                        </p>

                    </div>


                    <!-- SHIPPING ADDRESS -->

                    <div class="
                        order-detail-card
                        full
                    ">

                        <h3>
                            📍 Shipping Address
                        </h3>

                        <div class="
                            shipping-address-box
                        ">

                            <p>
                                <strong>
                                    Address:
                                </strong>

                                ${escapeOrderHTML(
                                    address.address || "-"
                                )}
                            </p>

                            <p>
                                <strong>
                                    Apartment / Suite:
                                </strong>

                                ${escapeOrderHTML(
                                    address.apartment || "-"
                                )}
                            </p>

                            <p>
                                <strong>
                                    City:
                                </strong>

                                ${escapeOrderHTML(
                                    address.city || "-"
                                )}
                            </p>

                            <p>
                                <strong>
                                    State:
                                </strong>

                                ${escapeOrderHTML(
                                    address.state || "-"
                                )}
                            </p>

                            <p>
                                <strong>
                                    PIN Code:
                                </strong>

                                ${escapeOrderHTML(
                                    address.pinCode || "-"
                                )}
                            </p>

                            <p>
                                <strong>
                                    Country:
                                </strong>

                                ${escapeOrderHTML(
                                    address.country || "India"
                                )}
                            </p>

                        </div>

                    </div>


                    <!-- PRODUCTS -->

                    <div class="
                        order-detail-card
                        full
                    ">

                        <h3>
                            🛍️ Products
                        </h3>

                        ${itemsHTML}

                    </div>


                    <!-- TOTAL -->

                    <div class="
                        order-detail-card
                        full
                    ">

                        <h3>
                            💰 Order Summary
                        </h3>

                        <div class="summary-line">

                            <span>
                                Subtotal
                            </span>

                            <strong>
                                ₹${Number(
                                    order.subtotal || 0
                                ).toFixed(2)}
                            </strong>

                        </div>

                        <div class="summary-line">

                            <span>
                                Discount
                            </span>

                            <strong>
                                ${Number(
                                    order.discountPercentage || 0
                                )}%
                            </strong>

                        </div>

                        <div class="summary-line">

                            <span>
                                Discount Amount
                            </span>

                            <strong>
                                ₹${Number(
                                    order.discountAmount || 0
                                ).toFixed(2)}
                            </strong>

                        </div>

                        <div class="summary-total">

                            <span>
                                Total
                            </span>

                            <strong>
                                ₹${Number(
                                    order.totalAmount || 0
                                ).toFixed(2)}
                            </strong>

                        </div>

                    </div>

                </div>


                <!-- ORDER STATUS -->

                <div class="order-status-section">

                    <h3>
                        📦 Order Status
                    </h3>

                    <select
                        id="adminOrderStatus">

                        ${
                            [
                                "Order Placed",
                                "Payment Confirmed",
                                "Processing",
                                "Packed",
                                "Shipped",
                                "Out for Delivery",
                                "Delivered",
                                "Cancelled"
                            ]
                            .map(function(status) {

                                return `
                                    <option
                                        value="${status}"
                                        ${
                                            status ===
                                            order.orderStatus
                                                ? "selected"
                                                : ""
                                        }
                                    >
                                        ${status}
                                    </option>
                                `;

                            })
                            .join("")
                        }

                    </select>

                    <button
                        class="update-order-status-btn"
                        onclick="updateAdminOrderStatus('${encodeURIComponent(
                            order.orderId
                        )}')">

                        Update Status

                    </button>

                </div>

            </div>

        `;


        document.body.appendChild(modal);


        modal.querySelector(
            ".order-close-btn"
        ).onclick = function() {

            modal.remove();

        };


        modal.onclick = function(event) {

            if (event.target === modal) {
                modal.remove();
            }

        };


    } catch (error) {

        console.error(error);

        alert(
            error.message ||
            "Unable to load order"
        );

    }

}


// ==============================
// UPDATE ORDER STATUS
// ==============================

async function updateAdminOrderStatus(
    orderId
) {

    const select =
        document.getElementById(
            "adminOrderStatus"
        );

    if (!select) return;

    const orderStatus =
        select.value;


    try {

        const response = await fetch(

            `${API_URL}/api/orders/` +
            decodeURIComponent(orderId) +
            "/status",

            {
                method: "PATCH",

                headers: {
                    "Content-Type":
                        "application/json",
                    ...authHeaders()
                },

                body: JSON.stringify({
                    orderStatus
                })
            }

        );


        const data =
            await response.json();


        if (!response.ok || !data.success) {

            throw new Error(
                data.message ||
                "Unable to update order"
            );

        }


        alert(
            "Order status updated successfully."
        );


        document
            .querySelectorAll(
                ".order-details-overlay"
            )
            .forEach(function(modal) {
                modal.remove();
            });


        loadOrders();


    } catch (error) {

        console.error(error);

        alert(
            error.message ||
            "Unable to update order status"
        );

    }

}


// ==============================
// ESCAPE HTML
// ==============================

function escapeOrderHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// ==============================
// ORDERS STYLES
// ==============================

function addOrdersStyles() {

    if (
        document.getElementById(
            "ordersDashboardStyles"
        )
    ) {
        return;
    }


    const style =
        document.createElement("style");


    style.id =
        "ordersDashboardStyles";


    style.textContent = `

        .orders-summary {

            display:grid;

            grid-template-columns:
                repeat(4,1fr);

            gap:18px;

            margin-bottom:25px;

        }


        .order-stat-card {

            background:#fff;

            border:1px solid #e5dfd4;

            border-radius:14px;

            padding:22px;

            box-shadow:
                0 5px 18px
                rgba(0,0,0,.05);

        }


        .order-stat-card span {

            display:block;

            color:#777;

            font-size:13px;

            margin-bottom:8px;

        }


        .order-stat-card strong {

            color:#073F32;

            font-family:Georgia,serif;

            font-size:30px;

        }


        .orders-table-card {

            background:#fff;

            border-radius:14px;

            border:1px solid #e5dfd4;

            overflow:hidden;

            box-shadow:
                0 5px 18px
                rgba(0,0,0,.05);

        }


        .orders-table-wrapper {

            overflow-x:auto;

        }


        .orders-table {

            width:100%;

            border-collapse:collapse;

            min-width:900px;

        }


        .orders-table th {

            background:#073F32;

            color:#fff;

            padding:16px;

            text-align:left;

            font-size:13px;

            white-space:nowrap;

        }


        .orders-table td {

            padding:17px 16px;

            border-bottom:
                1px solid #eee8dc;

            color:#34443d;

            white-space:nowrap;

        }


        .orders-table tr:hover {

            background:#faf8f2;

        }


        .order-payment,
        .order-status {

            display:inline-block;

            padding:6px 11px;

            border-radius:20px;

            font-size:12px;

            font-weight:600;

        }


        .order-payment.paid {

            background:#e2f4e8;

            color:#17713b;

        }


        .order-payment.pending {

            background:#fff1cf;

            color:#8b6800;

        }


        .order-status {

            background:#f1eadb;

            color:#073F32;

        }


        .order-view-btn {

            border:none;

            background:#073F32;

            color:#e8d39a;

            padding:9px 17px;

            border-radius:7px;

            cursor:pointer;

            font-weight:600;

        }


        .order-view-btn:hover {

            background:#d4af5a;

            color:#073F32;

        }


        .order-details-overlay {

            position:fixed;

            inset:0;

            background:
                rgba(0,0,0,.55);

            display:flex;

            align-items:center;

            justify-content:center;

            padding:25px;

            z-index:99999;

        }


        .order-details-modal {

            background:#fff;

            width:min(950px,100%);

            max-height:90vh;

            overflow-y:auto;

            border-radius:18px;

            padding:30px;

            box-shadow:
                0 25px 70px
                rgba(0,0,0,.3);

        }


        .order-details-header {

            display:flex;

            justify-content:space-between;

            align-items:center;

            border-bottom:
                1px solid #e5dfd4;

            padding-bottom:20px;

            margin-bottom:22px;

        }


        .order-details-header small {

            color:#b18a35;

            letter-spacing:2px;

        }


        .order-details-header h2 {

            margin:5px 0 0;

            color:#073F32;

            font-family:Georgia,serif;

        }


        .order-close-btn {

            border:none;

            width:38px;

            height:38px;

            border-radius:50%;

            background:#f0ece4;

            cursor:pointer;

            font-size:22px;

        }


        .order-details-grid {

            display:grid;

            grid-template-columns:
                1fr 1fr;

            gap:18px;

        }


        .order-detail-card {

            border:1px solid #e5dfd4;

            border-radius:12px;

            padding:20px;

        }


        .order-detail-card.full {

            grid-column:1 / -1;

        }


        .order-detail-card h3 {

            margin-top:0;

            color:#073F32;

            font-family:Georgia,serif;

        }


        .order-detail-card p {

            color:#555;

            line-height:1.6;

        }


        .shipping-address-box {

            background:#faf7ef;

            padding:18px;

            border-radius:10px;

        }


        .shipping-address-box p {

            margin:7px 0;

        }


        .order-item-row {

            display:flex;

            justify-content:space-between;

            gap:20px;

            padding:15px 0;

            border-bottom:
                1px solid #eee;

        }


        .order-item-row div div {

            color:#777;

            font-size:13px;

            margin-top:5px;

        }


        .summary-line {

            display:flex;

            justify-content:space-between;

            padding:9px 0;

        }


        .summary-total {

            display:flex;

            justify-content:space-between;

            margin-top:12px;

            padding:17px;

            background:#073F32;

            color:#fff;

            border-radius:9px;

            font-size:20px;

        }


        .summary-total strong {

            color:#e8d39a;

        }


        .order-status-section {

            margin-top:20px;

            border:1px solid #e5dfd4;

            border-radius:12px;

            padding:20px;

        }


        .order-status-section h3 {

            margin-top:0;

            color:#073F32;

        }


        .order-status-section select {

            width:100%;

            padding:12px;

            border:1px solid #ccc;

            border-radius:7px;

            margin-bottom:12px;

        }


        .update-order-status-btn {

            background:#d4af5a;

            color:#073F32;

            border:none;

            padding:11px 20px;

            border-radius:7px;

            font-weight:bold;

            cursor:pointer;

        }


        @media(max-width:800px) {

            .orders-summary {

                grid-template-columns:
                    repeat(2,1fr);

            }


            .order-details-grid {

                grid-template-columns:1fr;

            }


            .order-detail-card.full {

                grid-column:auto;

            }

        }


        @media(max-width:500px) {

            .orders-summary {

                grid-template-columns:1fr;

            }

        }

    `;


    document.head.appendChild(style);

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