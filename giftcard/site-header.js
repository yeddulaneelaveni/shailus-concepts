(function () {
  const config = window.ShailuCategoryConfig;
  const storeOrigin = window.location.origin;
  const route = function (path) {
    return `${storeOrigin.replace(/\/$/, "")}/${path}`;
  };
  const categories = config && config.CATEGORY_DEFINITIONS || [];
  const categoryUrl = function (slug) {
    return config && typeof config.buildCategoryUrl === "function"
      ? config.buildCategoryUrl(slug)
      : route(`category/${encodeURIComponent(slug)}`);
  };
  const categoryLinks = categories.map(function (category) {
    const href = config.buildCategoryUrl(category.slug);
    return `<a href="${href}">${category.title}</a>`;
  }).join("");
  const headerMarkup = `
    <div class="top-bar">
      <div class="top-left">
        <div class="shared-search" id="sharedSearch">
          <button class="icon-btn" id="sharedSearchToggle" type="button" aria-label="Search" title="Search">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </button>
          <input class="shared-search-input" id="sharedSearchInput" type="search" placeholder="Search products..." aria-label="Search products">
        </div>
      </div>
      <a class="brand-center" href="${route("index.html")}">
        <img src="${route("assets/logo.jpeg")}" alt="Shailu's Concepts">
        <span class="brand-name">Shailu's Concepts</span>
        <span class="brand-tagline">Return Gift Store For All Occasions</span>
      </a>
      <div class="top-right">
        <div class="shared-auth-controls" id="sharedAuthControls"></div>
        <a class="icon-btn shared-cart-link" href="${route("checkout.html")}" aria-label="Cart" title="Cart">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
          <span class="cart-badge" id="cartBadge">0</span>
        </a>
        <button class="hamburger" id="sharedHamburger" type="button" aria-label="Toggle menu" aria-expanded="false" aria-controls="mainNavRow">
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>
    <nav class="navbar" id="mainNavBar" aria-label="Main navigation">
      <div class="nav-row" id="mainNavRow">
        <a href="${route("index.html")}">Home</a>
        <div class="dropdown" id="returnGiftsDropdown">
          <button class="drop-toggle" id="sharedCategoryToggle" type="button" aria-expanded="false" aria-controls="categoryDropdownMenu">
            Categories <span class="arrow">▾</span>
          </button>
          <div class="dropdown-menu" id="categoryDropdownMenu">${categoryLinks}</div>
        </div>
        <a href="${categoryUrl("new-collection")}">New Collection</a>
        <a href="${categoryUrl("combos")}">Combos</a>
        <a href="${categoryUrl("corporate-gifts")}">Corporate Gifts</a>
        <a href="${route("terms-and-conditions.html")}">Terms &amp; Conditions</a>
        <a id="sharedTrackOrderLink" href="${route("track-order.html")}" hidden>Track Order</a>
      </div>
    </nav>
  `;

  const sharedStyles = document.createElement("style");
  sharedStyles.textContent = `
    .shared-site-header{position:sticky;top:0;z-index:1000;font-family:'Poppins',Arial,sans-serif}
    .shared-site-header .top-bar{position:relative;z-index:1;display:flex;align-items:center;justify-content:space-between;gap:14px;padding:10px 30px;background:linear-gradient(135deg,#0d3328,#134a3a)}
    .shared-site-header .top-left,.shared-site-header .top-right{display:flex;align-items:center;gap:22px;flex:1;min-width:0}
    .shared-site-header .top-right{justify-content:flex-end}
    .shared-site-header .brand-center{display:flex;flex-direction:column;align-items:center;gap:2px;flex-shrink:0;text-decoration:none}
    .shared-site-header .brand-center img{height:52px;width:auto;object-fit:contain;border-radius:6px}
    .shared-site-header .brand-name{margin-top:4px;color:#e6cf8f;font-family:'Playfair Display',Georgia,serif;font-size:20px;font-weight:700;line-height:1;white-space:nowrap}
    .shared-site-header .brand-tagline{color:#e6cf8f;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;opacity:.85;white-space:nowrap}
    .shared-site-header .icon-btn{position:relative;display:flex;align-items:center;justify-content:center;padding:0;border:0;color:#e6cf8f;background:none;text-decoration:none;cursor:pointer}
    .shared-site-header .shared-auth-controls{display:flex;align-items:center;gap:14px}
    .shared-site-header .shared-login-dropdown{position:relative}
    .shared-site-header .shared-login-toggle{padding:0;border:0;color:#e6cf8f;background:none;cursor:pointer}
    .shared-site-header .shared-login-menu{position:absolute;top:calc(100% + 12px);right:0;z-index:600;display:none;min-width:170px;padding:8px;border:1px solid #c9a455;border-radius:8px;background:linear-gradient(180deg,#0d3328,#134a3a);box-shadow:0 14px 30px rgba(13,51,40,.3)}
    .shared-site-header .shared-login-dropdown.open .shared-login-menu{display:block}
    .shared-site-header .shared-login-menu a{display:block;padding:10px 12px;border-radius:6px;color:#e6cf8f;font-size:13px;text-decoration:none;white-space:nowrap}
    .shared-site-header .shared-login-menu a:hover{color:#c9a455;background:rgba(201,164,85,.15)}
    .shared-site-header .shared-account-link{max-width:130px;overflow:hidden;color:#e6cf8f;font-size:13px;text-overflow:ellipsis;white-space:nowrap;text-decoration:none}
    .shared-site-header .shared-logout-btn{padding:0;border:0;color:#e6cf8f;background:none;font:inherit;font-size:13px;cursor:pointer}
    .shared-site-header [hidden]{display:none!important}
    .shared-site-header .cart-badge{position:absolute;top:-6px;right:-8px;display:flex;width:16px;height:16px;align-items:center;justify-content:center;border-radius:50%;color:#0d3328;background:#c9a455;font-size:10px;font-weight:700}
    .shared-site-header .shared-search{display:flex;align-items:center;gap:8px}
    .shared-site-header .shared-search-input{width:0;max-width:220px;padding:7px 0;border:0;border-bottom:1px solid transparent;outline:0;color:#fff;background:transparent;transition:width .2s ease,padding .2s ease}
    .shared-site-header .shared-search.expanded .shared-search-input{width:min(220px,35vw);padding:7px 4px;border-bottom-color:#e6cf8f}
    .shared-site-header .shared-search-input::placeholder{color:rgba(230,207,143,.75)}
    .shared-site-header .hamburger{display:none;flex-direction:column;justify-content:center;gap:5px;width:30px;height:30px;padding:0;border:0;background:none;cursor:pointer}
    .shared-site-header .hamburger span{display:block;width:100%;height:3px;border-radius:2px;background:#e6cf8f}
    .shared-site-header .navbar{position:relative;z-index:0;width:100%;max-width:100vw;overflow:visible;box-sizing:border-box;border-bottom:2px solid #0d3328;background:#fbeee2}
    .shared-site-header .nav-row{display:flex;align-items:center;justify-content:center;gap:34px;flex-wrap:nowrap;min-width:0;padding:14px 20px;overflow:visible}
    .shared-site-header .nav-row>a,.shared-site-header .nav-row .drop-toggle{display:flex;align-items:center;gap:5px;padding:2px 2px 4px;border:0;border-bottom:2px solid transparent;color:#0d3328;background:none;font:600 15px 'Poppins',Arial,sans-serif;text-decoration:none;white-space:nowrap;cursor:pointer;transition:color .2s ease}
    .shared-site-header .nav-row>a:hover,.shared-site-header .nav-row .drop-toggle:hover{color:#c9a455}
    .shared-site-header .dropdown{position:relative}
    .shared-site-header .drop-toggle .arrow{font-size:10px;transition:transform .2s ease}
    .shared-site-header .dropdown.open .drop-toggle .arrow{transform:rotate(180deg)}
    .shared-site-header .dropdown-menu{position:absolute;top:calc(100% + 12px);left:50%;z-index:500;display:none;min-width:460px;grid-template-columns:1fr 1fr;gap:2px 8px;padding:14px 10px;transform:translateX(-50%);border:1px solid #c9a455;border-radius:8px;background:linear-gradient(180deg,#0d3328,#134a3a);box-shadow:0 14px 30px rgba(13,51,40,.3)}
    .shared-site-header .dropdown.open .dropdown-menu{display:grid}
    .shared-site-header .dropdown-menu a{display:block;padding:10px 14px;border-radius:6px;color:#e6cf8f;font-size:14px;font-weight:500;text-decoration:none;white-space:nowrap}
    .shared-site-header .dropdown-menu a:hover{color:#c9a455;background:rgba(201,164,85,.15)}
    @media(max-width:760px){
      .shared-site-header .top-bar{gap:8px;padding:10px 14px}
      .shared-site-header .top-left,.shared-site-header .top-right{gap:12px}
      .shared-site-header .brand-name{font-size:14px}
      .shared-site-header .brand-tagline{display:none}
      .shared-site-header .brand-center img{height:42px}
      .shared-site-header .hamburger{display:flex;align-items:center;justify-content:center;width:40px;height:40px;padding:8px;border:1px solid #c9a455;border-radius:6px;background:#0d3328;box-shadow:0 2px 8px rgba(13,51,40,.2)}
      .shared-site-header .hamburger span{background:#e6cf8f}
      .shared-site-header .nav-row{position:absolute;top:100%;left:0;right:0;z-index:900;display:none;flex-direction:column;align-items:stretch;gap:0;max-height:calc(100dvh - 96px);padding:6px 0;overflow-x:hidden;overflow-y:auto;overscroll-behavior:contain;border-bottom:2px solid #c9a455;background:linear-gradient(135deg,#0d3328,#134a3a);box-shadow:0 14px 30px rgba(13,51,40,.3)}
      .shared-site-header .nav-row.mobile-open{display:flex}
      .shared-site-header .nav-row>a,.shared-site-header .nav-row .dropdown{width:100%}
      .shared-site-header .nav-row>a,.shared-site-header .nav-row .drop-toggle{width:100%;justify-content:space-between;padding:13px 24px;border-bottom:1px solid rgba(201,164,85,.45);color:#e6cf8f;background:#0d3328}
      .shared-site-header .nav-row>a:hover,.shared-site-header .nav-row .drop-toggle:hover{color:#c9a455;background:#174e3c}
      .shared-site-header .dropdown-menu{position:static;width:100%;min-width:0;grid-template-columns:1fr;transform:none;border:0;border-top:1px solid rgba(201,164,85,.55);border-bottom:1px solid rgba(201,164,85,.55);border-radius:0;background:#09271f;box-shadow:none}
      .shared-site-header .dropdown-menu a{border-bottom:1px solid rgba(201,164,85,.3);color:#e6cf8f}
      .shared-site-header .dropdown-menu a:last-child{border-bottom:0}
      .shared-site-header .dropdown-menu a:hover{color:#c9a455;background:rgba(201,164,85,.12)}
    }
  `;
  document.head.appendChild(sharedStyles);

  const header = document.getElementById("siteHeader") || document.querySelector("body > header.site-header");
  if (header) {
    header.classList.add("shared-site-header");
    header.innerHTML = headerMarkup;
  } else {
    const mount = document.getElementById("header");
    if (!mount) return;
    mount.innerHTML = `<header class="shared-site-header">${headerMarkup}</header>`;
  }

  const navRow = document.getElementById("mainNavRow");
  const dropdown = document.getElementById("returnGiftsDropdown");
  const categoryToggle = document.getElementById("sharedCategoryToggle");
  const hamburger = document.getElementById("sharedHamburger");
  const cartLink = document.querySelector(".shared-cart-link");
  const search = document.getElementById("sharedSearch");
  const searchToggle = document.getElementById("sharedSearchToggle");
  const searchInput = document.getElementById("sharedSearchInput");
  const authControls = document.getElementById("sharedAuthControls");
  const trackOrderLink = document.getElementById("sharedTrackOrderLink");

  categoryToggle.addEventListener("click", function (event) {
    event.stopPropagation();
    const isOpen = dropdown.classList.toggle("open");
    categoryToggle.setAttribute("aria-expanded", String(isOpen));
  });
  document.addEventListener("click", function (event) {
    if (!dropdown.contains(event.target)) {
      dropdown.classList.remove("open");
      categoryToggle.setAttribute("aria-expanded", "false");
    }
    const loginDropdown = document.getElementById("sharedLoginDropdown");
    if (loginDropdown && !loginDropdown.contains(event.target)) {
      loginDropdown.classList.remove("open");
      document.getElementById("sharedLoginToggle").setAttribute("aria-expanded", "false");
    }
  });
  authControls.addEventListener("click", function (event) {
    const toggle = event.target.closest("#sharedLoginToggle");
    if (!toggle) return;

    event.stopPropagation();
    const currentLoginDropdown = document.getElementById("sharedLoginDropdown");
    const isOpen = currentLoginDropdown.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });
  hamburger.addEventListener("click", function () {
    const isOpen = navRow.classList.toggle("mobile-open");
    hamburger.setAttribute("aria-expanded", String(isOpen));
  });
  navRow.addEventListener("click", function (event) {
    if (event.target.closest("a")) navRow.classList.remove("mobile-open");
  });
  cartLink.addEventListener("click", function (event) {
    if (typeof window.openCart === "function") {
      event.preventDefault();
      window.openCart();
    }
  });
  searchToggle.addEventListener("click", function () {
    search.classList.toggle("expanded");
    if (search.classList.contains("expanded")) searchInput.focus();
    else searchInput.value = "";
  });
  searchInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter" && searchInput.value.trim()) {
      window.location.href = `${route("index.html")}?search=${encodeURIComponent(searchInput.value.trim())}`;
    }
  });

  function escapeHTML(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function updateCustomerNavigation() {
    const session = window.ShailuCustomer.getSession();
    authControls.innerHTML =
      (session
        ? `<a class="shared-account-link" href="${route("track-order.html")}" aria-label="Customer account">` +
          `${escapeHTML(session.user.name || "My Account")}</a>` +
          '<button class="shared-logout-btn" id="sharedLogout" type="button">Logout</button>'
        : "") +
      `<div class="shared-login-dropdown" id="sharedLoginDropdown">
        <button class="icon-btn shared-login-toggle" id="sharedLoginToggle" type="button" aria-label="Login" title="Login" aria-expanded="false" aria-controls="sharedLoginMenu">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
        </button>
        <div class="shared-login-menu" id="sharedLoginMenu">
          <a href="${route("login.html")}">Login as User</a>
          <a href="${route("admin-login.html")}">Login as Admin</a>
        </div>
      </div>`;
    if (session) {
      document.getElementById("sharedLogout").addEventListener("click", function () {
        window.ShailuCustomer.logout();
        window.location.href = route("login.html");
      });
      trackOrderLink.hidden = false;
    } else {
      trackOrderLink.hidden = true;
    }
    updateFooterTrackLink(Boolean(session));
  }

  function updateFooterTrackLink(isLoggedIn) {
    let hasQuickLinks = false;
    document.querySelectorAll(".footer-top .footer-col").forEach(function (column) {
      const list = column.querySelector("ul");
      if (!list || list.id === "footerCategoryList") return;
      const heading = column.querySelector("h4");
      if (heading && !/quick links|explore|useful links/i.test(heading.textContent)) return;
      hasQuickLinks = true;

      const existing = list.querySelector('[data-customer-track-order="true"]');
      if (isLoggedIn && !existing) {
        const item = document.createElement("li");
        item.dataset.customerTrackOrder = "true";
        item.innerHTML = `<a href="${route("track-order.html")}">Track Order</a>`;
        list.appendChild(item);
      } else if (!isLoggedIn && existing) {
        existing.remove();
      }
    });

    const footerBottom = document.querySelector(".footer-bottom");
    if (footerBottom && !footerBottom.closest(".legacy-footer")) {
      let footerLink = footerBottom.querySelector('[data-customer-track-order="true"]');
      if (isLoggedIn && !hasQuickLinks && !footerLink) {
        footerLink = document.createElement("a");
        footerLink.dataset.customerTrackOrder = "true";
        footerLink.href = route("track-order.html");
        footerLink.textContent = "Track Order";
        footerLink.style.marginRight = "16px";
        footerBottom.prepend(footerLink);
      } else if ((!isLoggedIn || hasQuickLinks) && footerLink) {
        footerLink.remove();
      }
    }

    const legacyFooter = document.querySelector(".legacy-footer-bottom");
    if (legacyFooter) {
      let link = legacyFooter.querySelector('[data-customer-track-order="true"]');
      if (isLoggedIn && !link) {
        link = document.createElement("a");
        link.dataset.customerTrackOrder = "true";
        link.href = route("track-order.html");
        link.textContent = "Track Order";
        link.style.marginRight = "16px";
        legacyFooter.prepend(link);
      } else if (!isLoggedIn && link) {
        link.remove();
      }
    }
  }

  function ensureFooterTermsLink() {
    let hasQuickLinks = false;
    document.querySelectorAll(".footer-top .footer-col").forEach(function (column) {
      const list = column.querySelector("ul");
      if (!list || list.id === "footerCategoryList") return;
      const heading = column.querySelector("h4");
      if (heading && !/quick links|explore|useful links/i.test(heading.textContent)) return;
      hasQuickLinks = true;

      let item = Array.from(list.querySelectorAll("a")).find(function (link) {
        return /terms\s*(?:&|and)\s*conditions/i.test(link.textContent);
      });
      if (!item) {
        const listItem = document.createElement("li");
        item = document.createElement("a");
        item.textContent = "Terms & Conditions";
        listItem.appendChild(item);
        list.appendChild(listItem);
      }
      item.href = route("terms-and-conditions.html");
    });

    const footerBottom = document.querySelector(".footer-bottom");
    if (footerBottom && !hasQuickLinks &&
        !footerBottom.querySelector('[data-terms-link="true"]')) {
      const link = document.createElement("a");
      link.dataset.termsLink = "true";
      link.href = route("terms-and-conditions.html");
      link.textContent = "Terms & Conditions";
      link.style.marginRight = "16px";
      footerBottom.prepend(link);
    }

    const legacyFooter = document.querySelector(".legacy-footer-bottom");
    if (legacyFooter) {
      const existing = Array.from(legacyFooter.querySelectorAll("a")).find(function (link) {
        return /terms\s*(?:&|and)\s*conditions/i.test(link.textContent);
      });
      if (existing) {
        existing.href = route("terms-and-conditions.html");
      } else {
        const link = document.createElement("a");
        link.dataset.termsLink = "true";
        link.href = route("terms-and-conditions.html");
        link.textContent = "Terms & Conditions";
        link.style.marginRight = "16px";
        legacyFooter.prepend(link);
      }
    }
  }

  function updateCartBadge() {
    const count = window.ShailuCustomer.loadCart().reduce(function (total, item) {
      return total + Number(item.qty || 0);
    }, 0);
    document.querySelectorAll(".shared-site-header .cart-badge").forEach(function (badge) {
      badge.textContent = String(count);
    });
  }

  ensureFooterTermsLink();
  updateCustomerNavigation();
  updateCartBadge();
  window.addEventListener(window.ShailuCustomer.stateEvent, updateCustomerNavigation);
  window.addEventListener(window.ShailuCustomer.cartEvent, updateCartBadge);
  window.ShailuCustomer.validateSession().catch(function (error) {
    console.error("Customer session validation failed:", error.message);
  });
})();
