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

if (footerMount) {
    footerMount.innerHTML = `
        <footer class="legacy-footer">
            <div class="legacy-footer-inner">
                <div>
                    <h2>Shailu's Concepts</h2>
                    <p>Thoughtful gifts for weddings, celebrations, and everyday moments.</p>
                </div>
                <div>
                    <h3>Contact</h3>
                    <p><a href="tel:+918825498438">+91 88254 98438</a></p>
                    <p><a href="mailto:shailusconcepts@gmail.com">shailusconcepts@gmail.com</a></p>
                </div>
            </div>
            <div class="legacy-footer-bottom">Copyright &copy; 2026 Shailu's Concepts. All rights reserved.</div>
        </footer>
    `;
}
