if (typeof globalThis !== "undefined" && typeof globalThis.__webpack_require__ !== "function") {
  globalThis.__webpack_require__ = function () {
    return {};
  };
}
if (typeof process !== "undefined") {
  process.title = "browser";
}
if (typeof globalThis !== "undefined" && typeof globalThis.wx === "undefined" && typeof uni !== "undefined") {
  globalThis.wx = uni;
}
