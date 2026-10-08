(function () {
  const configuredApiBase = window.SHAILU_API_BASE_URL || "";
  const isLocalDevelopment =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";
  const defaultApiBase = isLocalDevelopment
    ? `${window.location.protocol}//localhost:5000`
    : "https://shailus-concepts.onrender.com";

  window.API_BASE_URL = (configuredApiBase || defaultApiBase)
    .replace(/\/+$/, "");

  window.resolveStoreImageUrl = function (imagePath) {
    if (!imagePath) return "";

    const normalizedPath = String(imagePath).trim().replace(/\\/g, "/");
    if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(normalizedPath)) {
      return normalizedPath;
    }

    const rootRelativePath = normalizedPath
      .replace(/^(?:\.\.\/|\.\/)+/, "")
      .replace(/^\/+/, "");

    if (/^uploads\//i.test(rootRelativePath)) {
      return `${window.API_BASE_URL}/${rootRelativePath}`;
    }

    return new URL(rootRelativePath, `${window.location.origin}/`).href;
  };
})();
