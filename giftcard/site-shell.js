const headerMount = document.getElementById("header");
const footerMount = document.getElementById("footer");

if (headerMount) {
    headerMount.innerHTML = `
        <header class="legacy-site-header">
            <div class="legacy-header-inner">
                <a class="legacy-brand" href="index.html">Shailu's Concepts</a>
                <button class="legacy-menu-toggle" type="button" aria-label="Open navigation" aria-expanded="false" aria-controls="legacyNavLinks">
                    <span></span><span></span><span></span>
                </button>
                <nav class="legacy-nav-links" id="legacyNavLinks" aria-label="Main navigation">
                    <a href="index.html">Home</a>
                    <a href="gallery.html">Gallery</a>
                    <a href="customized-order.html">Customized Orders</a>
                    <a href="contact.html">Place an Order</a>
                    <a href="checkout.html">Cart</a>
                </nav>
            </div>
        </header>
    `;

    const menuToggle = headerMount.querySelector(".legacy-menu-toggle");
    const navLinks = headerMount.querySelector(".legacy-nav-links");

    menuToggle.addEventListener("click", () => {
        const isOpen = navLinks.classList.toggle("is-open");
        menuToggle.setAttribute("aria-expanded", String(isOpen));
        menuToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
    });

    navLinks.addEventListener("click", event => {
        if (event.target.closest("a")) {
            navLinks.classList.remove("is-open");
            menuToggle.setAttribute("aria-expanded", "false");
            menuToggle.setAttribute("aria-label", "Open navigation");
        }
    });
}

const footerStyles = document.createElement("style");
footerStyles.id = "shared-footer-styles";
footerStyles.textContent = `
    .shared-footer {
        --shared-footer-green: #0D3328;
        --shared-footer-gold: #C9A84C;
        --shared-footer-cream: #F8F5EE;
        box-sizing: border-box;
        width: 100%;
        margin: 0;
        padding: 38px clamp(18px, 3.5vw, 48px) 0;
        color: var(--shared-footer-gold);
        background: var(--shared-footer-green);
        font-family: 'Poppins', Arial, sans-serif;
    }
    .shared-footer *,
    .shared-footer *::before,
    .shared-footer *::after { box-sizing: border-box; }
    .shared-footer .footer-top {
        display: grid;
        grid-template-columns: minmax(190px, 1.4fr) minmax(185px, 1fr) minmax(210px, 1.35fr) minmax(150px, .9fr) minmax(215px, 1.35fr);
        gap: clamp(18px, 2.2vw, 32px);
        width: min(100%, 1420px);
        margin: 0 auto;
        padding: 0 0 30px;
        align-items: start;
    }
    .shared-footer .footer-col { min-width: 0; }
    .shared-footer .footer-brand img {
        display: block;
        width: auto;
        max-width: 100%;
        height: 62px;
        margin: 0 0 13px;
        object-fit: contain;
        object-position: left center;
        border-radius: 7px;
    }
    .shared-footer .footer-brand p,
    .shared-footer .footer-col p,
    .shared-footer .footer-col li,
    .shared-footer .footer-col a {
        color: var(--shared-footer-gold);
        font-size: 13px;
        line-height: 1.65;
    }
    .shared-footer .footer-brand p { margin: 0 0 12px; }
    .shared-footer .footer-rating { display: flex; flex-wrap: wrap; align-items: center; gap: 5px 8px; }
    .shared-footer .stars { color: var(--shared-footer-gold); font-size: 15px; letter-spacing: 1px; }
    .shared-footer .rating-text { color: var(--shared-footer-gold); font-size: 12px; }
    .shared-footer .rating-text a { font-size: inherit; }
    .shared-footer .footer-col h4 {
        margin: 0 0 9px;
        color: var(--shared-footer-gold);
        font-family: 'Playfair Display', Georgia, serif;
        font-size: 14px;
        font-weight: 700;
        letter-spacing: .7px;
        line-height: 1.35;
        text-transform: uppercase;
    }
    .shared-footer .footer-divider {
        width: 36px;
        height: 2px;
        margin: 0 0 13px;
        border-radius: 2px;
        background: rgba(201, 168, 76, .72);
    }
    .shared-footer .footer-col ul {
        display: block;
        margin: 0;
        padding: 0;
        list-style: none;
    }
    .shared-footer .footer-col li { min-width: 0; margin: 0; padding: 0; }
    .shared-footer .footer-col a {
        text-decoration: none;
        overflow-wrap: anywhere;
        transition: color .18s ease;
    }
    .shared-footer .footer-col a:hover,
    .shared-footer .footer-col a:focus-visible { color: var(--shared-footer-cream); }
    .shared-footer .footer-category-links {
        display: block;
    }
    .shared-footer .footer-category-links a {
        display: block;
        min-width: 0;
        padding: 2px 0;
    }
    .shared-footer .footer-quick-links a { display: block; padding: 2px 0; }
    .shared-footer .footer-hours { display: grid !important; gap: 8px; }
    .shared-footer .footer-hours li,
    .shared-footer .footer-contact li {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        color: var(--shared-footer-gold);
        line-height: 1.55;
    }
    .shared-footer .footer-hours svg,
    .shared-footer .footer-contact svg {
        flex: 0 0 15px;
        width: 15px;
        height: 15px;
        margin-top: 3px;
        color: var(--shared-footer-gold);
        stroke: currentColor;
    }
    .shared-footer .follow-label {
        margin: 13px 0 7px;
        color: var(--shared-footer-gold);
        font-size: 12px;
        font-weight: 600;
    }
    .shared-footer .footer-social { display: flex; flex-wrap: wrap; gap: 8px; }
    .shared-footer .footer-social a {
        display: inline-flex;
        width: 34px;
        height: 34px;
        align-items: center;
        justify-content: center;
        border: 1px solid rgba(201, 168, 76, .55);
        border-radius: 50%;
        color: var(--shared-footer-gold);
    }
    .shared-footer .footer-social a:hover,
    .shared-footer .footer-social a:focus-visible {
        color: var(--shared-footer-green);
        background: var(--shared-footer-cream);
        border-color: var(--shared-footer-cream);
    }
    .shared-footer .footer-social svg { width: 17px; height: 17px; stroke: currentColor; }
    .shared-footer .footer-bottom {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
        gap: 8px 16px;
        width: min(100%, 1420px);
        margin: 0 auto;
        padding: 15px 12px 17px;
        border-top: 1px solid rgba(201, 168, 76, .32);
        color: var(--shared-footer-gold);
        font-size: 12px;
        line-height: 1.6;
        text-align: center;
    }
    .shared-footer .footer-bottom p { margin: 0; color: inherit; font-size: inherit; line-height: inherit; }
    .shared-footer .footer-bottom strong { color: var(--shared-footer-gold); }
    @media (max-width: 1100px) {
        .shared-footer .footer-top { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    }
    @media (max-width: 720px) {
        .shared-footer { padding: 30px 20px 0; }
        .shared-footer .footer-top { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 24px 20px; padding-bottom: 24px; }
        .shared-footer .footer-brand { grid-column: 1 / -1; }
        .shared-footer .footer-brand p { max-width: 560px; }
        .shared-footer .footer-category { grid-column: 1 / -1; }
        .shared-footer .footer-category-links { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    }
    @media (max-width: 420px) {
        .shared-footer { padding-right: 16px; padding-left: 16px; }
        .shared-footer .footer-top { gap: 20px 14px; }
        .shared-footer .footer-category-links { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .shared-footer .footer-col h4 { font-size: 13px; }
        .shared-footer .footer-brand p,
        .shared-footer .footer-col p,
        .shared-footer .footer-col li,
        .shared-footer .footer-col a { font-size: 12px; }
    }
`;
document.head.appendChild(footerStyles);

function escapeFooterText(value) {
    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

const footerOrigin = window.location.origin.replace(/\/$/, "");
const footerRoute = path => `${footerOrigin}/${path}`;
const footerCategoryConfig = window.ShailuCategoryConfig;
const footerCategoryLinks = footerCategoryConfig &&
    Array.isArray(footerCategoryConfig.CATEGORY_DEFINITIONS)
    ? footerCategoryConfig.CATEGORY_DEFINITIONS.slice(0, 6).map(category => {
        const href = footerCategoryConfig.buildCategoryUrl(category.slug);
        return `<li><a href="${href}">${escapeFooterText(category.title)}</a></li>`;
    }).join("")
    : "";
const sharedFooter = document.createElement("footer");
sharedFooter.className = "footer shared-footer";
sharedFooter.id = "siteFooter";
sharedFooter.innerHTML = `
    <div class="footer-top">
        <div class="footer-col footer-brand">
            <a href="${footerRoute("index.html")}" aria-label="Shailu's Concepts home">
                <img src="${footerRoute("assets/logo.jpeg")}" alt="Shailu's Concepts">
            </a>
            <p>At Shailu's Concepts, we offer thoughtful gifts for weddings, birthdays, baby showers, housewarmings, corporate events, and festivals. Our theme-based and customized gifting makes every occasion memorable.</p>
            <div class="footer-rating">
                <span class="stars" aria-label="5 stars">★★★★★</span>
                <span class="rating-text">4.8 · <a href="https://www.google.com/search?q=Shailu%27s+Concepts+Return+Gifts+for+All+Occasions+proddatur" target="_blank" rel="noopener">33 Google Reviews</a></span>
            </div>
        </div>
        <div class="footer-col">
            <h4>Quick Links</h4>
            <div class="footer-divider"></div>
            <ul class="footer-quick-links">
                <li><a href="${footerRoute("index.html")}">Home</a></li>
                <li><a href="${footerRoute("index.html#productGrid")}">Return Gifts</a></li>
                <li><a href="${footerRoute("category/new-collection")}">New Collection</a></li>
                <li><a href="${footerRoute("category/combos")}">Combos</a></li>
                <li><a href="${footerRoute("category/corporate-gifts")}">Corporate Gifts</a></li>
                <li><a href="${footerRoute("terms-and-conditions.html")}">Terms &amp; Conditions</a></li>
            </ul>
        </div>
        <div class="footer-col footer-category">
            <h4>Category</h4>
            <div class="footer-divider"></div>
            <ul class="footer-category-links" id="footerCategoryList">${footerCategoryLinks}</ul>
        </div>
        <div class="footer-col">
            <h4>Opening Hours</h4>
            <div class="footer-divider"></div>
            <ul class="footer-hours">
                <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg><span>Monday – Saturday:<br>10.00 am – 7.30 pm</span></li>
                <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg><span>Sunday:<br>Opens 10 am</span></li>
            </ul>
        </div>
        <div class="footer-col">
            <h4>Connect With Us</h4>
            <div class="footer-divider"></div>
            <ul class="footer-contact">
                <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg><span>Shop No : 39, Shivasankara Shopping Mall, Korrapadu Rd, YMR Colony, Proddatur, Andhra Pradesh – 516360</span></li>
                <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg><a href="mailto:shailusconcepts@gmail.com">shailusconcepts@gmail.com</a></li>
                <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.77a16 16 0 0 0 6.29 6.29l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2.02z"></path></svg><a href="tel:+918825498438">+91 88254 98438</a></li>
            </ul>
            <p class="follow-label">Follow Us</p>
            <div class="footer-social">
                <a href="https://www.facebook.com" target="_blank" rel="noopener" aria-label="Facebook"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg></a>
                <a href="https://www.instagram.com" target="_blank" rel="noopener" aria-label="Instagram"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg></a>
                <a href="https://wa.me/919704123499" target="_blank" rel="noopener" aria-label="WhatsApp"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg></a>
            </div>
        </div>
    </div>
    <div class="footer-bottom">
        <p>Copyright &copy; 2026 <strong>Shailu's Concepts</strong>. All rights reserved.</p>
    </div>
`;

const footerCandidates = Array.from(
    document.querySelectorAll("footer.footer, footer.legacy-footer, #footer")
);
const firstFooter = footerCandidates[0];
if (firstFooter) {
    firstFooter.replaceWith(sharedFooter);
    footerCandidates.slice(1).forEach(footer => footer.remove());
} else if (footerMount) {
    footerMount.replaceWith(sharedFooter);
}
