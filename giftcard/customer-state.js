(function () {
  const tokenKey = "token";
  const userKey = "user";
  const guestCartKey = "shailusCart_guest";
  const stateEvent = "shailu:statechange";
  const cartEvent = "shailu:cartchange";

  function dispatch(name) {
    window.dispatchEvent(new CustomEvent(name));
  }

  function clearSession() {
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(userKey);
    dispatch(stateEvent);
  }

  function decodePayload(token) {
    try {
      const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
      return JSON.parse(atob(payload));
    } catch (error) {
      return null;
    }
  }

  function getSession() {
    const token = localStorage.getItem(tokenKey);
    if (!token) return null;

    let user;
    try {
      user = JSON.parse(localStorage.getItem(userKey) || "null");
    } catch (error) {
      clearSession();
      return null;
    }

    if (!user) {
      if (!localStorage.getItem("adminToken") && !localStorage.getItem("admin")) {
        clearSession();
      }
      return null;
    }
    if (user.role === "admin") return null;

    const payload = decodePayload(token);
    if (
      !user.id ||
      !payload ||
      String(payload.id) !== String(user.id) ||
      (payload.exp && payload.exp * 1000 <= Date.now())
    ) {
      clearSession();
      return null;
    }

    return { token, user };
  }

  function setSession(token, user) {
    if (!token || !user || !user.id || user.role === "admin") {
      throw new Error("A valid customer session is required");
    }

    const previous = getSession();
    localStorage.setItem(tokenKey, token);
    localStorage.setItem(userKey, JSON.stringify(user));
    if (!previous || JSON.stringify(previous.user) !== JSON.stringify(user)) {
      dispatch(stateEvent);
    }
  }

  function cartKey() {
    const session = getSession();
    return session
      ? `shailusCart_${encodeURIComponent(String(session.user.id))}`
      : guestCartKey;
  }

  function loadCart() {
    try {
      const cart = JSON.parse(localStorage.getItem(cartKey()) || "[]");
      return Array.isArray(cart) ? cart : [];
    } catch (error) {
      return [];
    }
  }

  function saveCart(cart) {
    if (!Array.isArray(cart)) {
      throw new TypeError("Cart must be an array");
    }
    localStorage.setItem(cartKey(), JSON.stringify(cart));
    dispatch(cartEvent);
  }

  async function validateSession() {
    const session = getSession();
    if (!session) return null;

    const response = await fetch(`${window.API_BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${session.token}` }
    });

    if (response.status === 401 || response.status === 403) {
      clearSession();
      return null;
    }
    if (!response.ok) {
      throw new Error("Unable to validate customer session");
    }

    const data = await response.json();
    if (!data.user || String(data.user.id) !== String(session.user.id)) {
      clearSession();
      return null;
    }

    setSession(session.token, data.user);
    return { token: session.token, user: data.user };
  }

  function logout() {
    clearSession();
  }

  window.ShailuCustomer = {
    getSession,
    setSession,
    validateSession,
    logout,
    cartKey,
    loadCart,
    saveCart,
    stateEvent,
    cartEvent
  };

  window.addEventListener("storage", function (event) {
    if (event.key === tokenKey || event.key === userKey) {
      dispatch(stateEvent);
    }
    if (event.key && event.key.startsWith("shailusCart_")) {
      dispatch(cartEvent);
    }
  });
})();
