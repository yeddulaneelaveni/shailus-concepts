(function () {
  const configuredApiBase = window.SHAILU_API_BASE_URL || "";
  const isLocalDevelopment =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";
  const defaultApiBase = isLocalDevelopment
    ? `${window.location.protocol}//localhost:5000`
    : window.location.origin;

  window.API_BASE_URL = (configuredApiBase || defaultApiBase)
    .replace(/\/+$/, "");
})();
