const Razorpay = require("razorpay");
const crypto = require("crypto");
const Order = require("../models/order");
const Product = require("../models/Product");

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

const validateCustomer = (customer) => {
    if (!customer || typeof customer !== "object") {
        return null;
    }

    const normalized = {
        name: String(customer.name || "").trim(),
        email: String(customer.email || "").trim(),
        phone: String(customer.phone || "").trim(),
        address: String(customer.address || "").trim(),
        apartment: String(customer.apartment || "").trim(),
        city: String(customer.city || "").trim(),
        state: String(customer.state || "").trim(),
        country: String(customer.country || "India").trim(),
        pinCode: String(customer.pinCode || "").trim()
    };

    return normalized.name &&
        normalized.phone &&
        normalized.address &&
        normalized.city &&
        normalized.state &&
        normalized.pinCode
        ? normalized
        : null;
};

const createStoreOrderId = () => {
    const now = new Date();
    const date = [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, "0"),
        String(now.getDate()).padStart(2, "0")
    ].join("");

    return `SC-${date}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
};

const createWhatsappUrl = (order) => {
    const itemLines = order.items.map((item) =>
        `• ${item.name} × ${item.quantity} — ₹${Number(item.finalPrice).toFixed(2)}`
    ).join("\n");

    const address = order.shippingAddress;
    const message =
        `🛍️ NEW ORDER — SHAILU'S CONCEPTS\n\n` +
        `Order ID: ${order.orderId}\n\n` +
        `👤 Customer:\n${order.customerName}\n\n` +
        `📞 Phone:\n${order.phone}\n\n` +
        `📧 Email:\n${order.email || "Not provided"}\n\n` +
        `📦 ITEMS:\n${itemLines}\n\n` +
        `💰 Subtotal:\n₹${Number(order.subtotal).toFixed(2)}\n\n` +
        `🏷️ Discount:\n${order.discountPercentage}%\n\n` +
        `💸 Discount Amount:\n₹${Number(order.discountAmount).toFixed(2)}\n\n` +
        `💵 TOTAL:\n₹${Number(order.totalAmount).toFixed(2)}\n\n` +
        `📍 SHIPPING ADDRESS:\n${address.address}\n${address.apartment || ""}\n` +
        `${address.city}\n${address.state}\n${address.pinCode}\n${address.country || "India"}\n\n` +
        `💳 PAYMENT:\nStatus: PAID\n\n` +
        `Razorpay Payment ID:\n${order.razorpayPaymentId}\n\n` +
        `📌 ORDER STATUS:\n${order.orderStatus}`;

    return `https://wa.me/917569996688?text=${encodeURIComponent(message)}`;
};

const signaturesMatch = (secret, body, signature) => {
    if (!secret || !Buffer.isBuffer(body) || typeof signature !== "string") {
        return false;
    }

    const expected = crypto
        .createHmac("sha256", secret)
        .update(body)
        .digest();

    if (!/^[a-f\d]{64}$/i.test(signature)) {
        return false;
    }

    const received = Buffer.from(signature, "hex");
    return received.length === expected.length &&
        crypto.timingSafeEqual(received, expected);
};

exports.createOrder = async (req, res) => {
    try {
        const { items: requestedItems } = req.body;
        const customer = validateCustomer(req.body.customer);

        if (!customer) {
            return res.status(400).json({
                success: false,
                message: "Customer and shipping information is required"
            });
        }

        if (!Array.isArray(requestedItems) || requestedItems.length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one product is required"
            });
        }

        const quantitiesByProduct = new Map();
        for (const item of requestedItems) {
            const productId = Number(item && item.productId);
            const quantity = Number(item && item.quantity);

            if (
                !Number.isSafeInteger(productId) ||
                productId <= 0 ||
                !Number.isSafeInteger(quantity) ||
                quantity <= 0
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Product IDs and quantities must be positive whole numbers"
                });
            }

            const totalQuantity = (quantitiesByProduct.get(productId) || 0) + quantity;
            if (!Number.isSafeInteger(totalQuantity)) {
                return res.status(400).json({
                    success: false,
                    message: "Product quantity is too large"
                });
            }
            quantitiesByProduct.set(productId, totalQuantity);
        }

        const productIds = [...quantitiesByProduct.keys()];
        const products = await Product.find({
            productId: { $in: productIds }
        }).lean();
        const productsById = new Map(
            products.map((product) => [Number(product.productId), product])
        );

        if (productsById.size !== productIds.length) {
            return res.status(400).json({
                success: false,
                message: "One or more products are unavailable"
            });
        }

        let totalQuantity = 0;
        let subtotalPaise = 0;
        const orderItems = productIds.map((productId) => {
            const product = productsById.get(productId);
            const quantity = quantitiesByProduct.get(productId);
            const unitPricePaise = Math.round(Number(product.price) * 100);

            if (
                !Number.isSafeInteger(unitPricePaise) ||
                unitPricePaise < 0
            ) {
                throw new Error(`Product ${productId} has an invalid stored price`);
            }

            totalQuantity += quantity;
            subtotalPaise += unitPricePaise * quantity;

            return {
                productId: String(product.productId),
                name: product.name,
                image: product.image || "",
                quantity,
                originalPrice: unitPricePaise / 100,
                finalPrice: unitPricePaise / 100,
                discountPercentage: 0
            };
        });

        if (
            !Number.isSafeInteger(totalQuantity) ||
            !Number.isSafeInteger(subtotalPaise) ||
            subtotalPaise <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "The calculated order amount is invalid"
            });
        }

        const discountPercentage =
            totalQuantity >= 51 ? 30 : totalQuantity >= 10 ? 20 : 0;
        const discountPaise = Math.round(
            subtotalPaise * discountPercentage / 100
        );
        const totalPaise = subtotalPaise - discountPaise;

        if (!Number.isSafeInteger(totalPaise) || totalPaise <= 0) {
            return res.status(400).json({
                success: false,
                message: "The calculated order amount is invalid"
            });
        }

        const storeOrderId = createStoreOrderId();
        const razorpayOrder = await razorpay.orders.create({
            amount: totalPaise,
            currency: "INR",
            receipt: storeOrderId
        });

        const order = await Order.create({
            orderId: storeOrderId,
            userId: req.user.id,
            customerName: customer.name,
            email: customer.email,
            phone: customer.phone,
            shippingAddress: {
                address: customer.address,
                apartment: customer.apartment,
                city: customer.city,
                state: customer.state,
                country: customer.country,
                pinCode: customer.pinCode
            },
            items: orderItems,
            subtotal: subtotalPaise / 100,
            discountPercentage,
            discountAmount: discountPaise / 100,
            totalAmount: totalPaise / 100,
            razorpayOrderId: razorpayOrder.id,
            paymentStatus: "Pending",
            orderStatus: "Order Placed"
        });

        return res.status(200).json({
            success: true,
            order: razorpayOrder,
            keyId: process.env.RAZORPAY_KEY_ID,
            storeOrderId: order.orderId,
            pricing: {
                subtotal: order.subtotal,
                discountPercentage: order.discountPercentage,
                discountAmount: order.discountAmount,
                totalAmount: order.totalAmount
            }
        });
    } catch (error) {
        console.error("Razorpay create order error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to create payment order"
        });
    }
};

exports.verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id: razorpayOrderId,
            razorpay_payment_id: razorpayPaymentId,
            razorpay_signature: razorpaySignature
        } = req.body;

        if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
            return res.status(400).json({
                success: false,
                message: "Payment information is incomplete"
            });
        }

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpayOrderId}|${razorpayPaymentId}`)
            .digest();
        const suppliedSignature =
            typeof razorpaySignature === "string" &&
            /^[a-f\d]{64}$/i.test(razorpaySignature)
                ? Buffer.from(razorpaySignature, "hex")
                : Buffer.alloc(0);

        if (
            suppliedSignature.length !== expectedSignature.length ||
            !crypto.timingSafeEqual(suppliedSignature, expectedSignature)
        ) {
            return res.status(400).json({
                success: false,
                message: "Payment verification failed"
            });
        }

        const order = await Order.findOne({
            razorpayOrderId,
            userId: req.user.id
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Payment order not found"
            });
        }

        if (order.paymentStatus === "Paid") {
            if (order.razorpayPaymentId !== razorpayPaymentId) {
                return res.status(409).json({
                    success: false,
                    message: "This order is already associated with another payment"
                });
            }

            return res.status(200).json({
                success: true,
                message: "Order already exists",
                paymentId: razorpayPaymentId,
                orderId: razorpayOrderId,
                storeOrderId: order.orderId,
                whatsappUrl: createWhatsappUrl(order)
            });
        }

        order.razorpayPaymentId = razorpayPaymentId;
        order.paymentStatus = "Paid";
        await order.save();

        return res.status(200).json({
            success: true,
            message: "Payment verified and order saved successfully",
            paymentId: razorpayPaymentId,
            razorpayOrderId,
            storeOrderId: order.orderId,
            whatsappUrl: createWhatsappUrl(order)
        });
    } catch (error) {
        console.error("Payment verification error:", error);
        return res.status(500).json({
            success: false,
            message: "Payment verified but order update failed"
        });
    }
};

exports.handleWebhook = async (req, res) => {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.get("x-razorpay-signature");

    if (!webhookSecret) {
        return res.status(503).json({
            success: false,
            message: "Payment webhook is not configured"
        });
    }

    if (!signaturesMatch(webhookSecret, req.rawBody, signature)) {
        return res.status(400).json({
            success: false,
            message: "Invalid webhook signature"
        });
    }

    try {
        const event = req.body && req.body.event;
        const payment = req.body &&
            req.body.payload &&
            req.body.payload.payment &&
            req.body.payload.payment.entity;

        if (
            !["payment.captured", "payment.failed"].includes(event) ||
            !payment ||
            !payment.order_id
        ) {
            return res.status(200).json({ received: true });
        }

        const order = await Order.findOne({
            razorpayOrderId: payment.order_id
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order for this payment was not found"
            });
        }

        if (event === "payment.failed") {
            if (order.paymentStatus === "Pending") {
                order.paymentStatus = "Failed";
                await order.save();
            }
            return res.status(200).json({ received: true });
        }

        const expectedAmount = Math.round(order.totalAmount * 100);
        if (
            payment.currency !== "INR" ||
            Number(payment.amount) !== expectedAmount ||
            !payment.id
        ) {
            return res.status(400).json({
                success: false,
                message: "Payment amount does not match the order"
            });
        }

        if (order.paymentStatus === "Paid") {
            if (order.razorpayPaymentId !== payment.id) {
                console.error(
                    "Additional captured payment reported for an already-paid order",
                    order.orderId
                );
            }
            return res.status(200).json({ received: true });
        }

        order.razorpayPaymentId = payment.id;
        order.paymentStatus = "Paid";
        await order.save();
        return res.status(200).json({ received: true });
    } catch (error) {
        console.error("Razorpay webhook processing error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to process payment webhook"
        });
    }
};
