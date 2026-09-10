export default defineNitroPlugin((nitroApp) => {
  if (!(
    import.meta.dev ||
    (typeof process !== "undefined" && process.env.NODE_ENV === "development")
  )) {
    return;
  }

  nitroApp.hooks.hook("response", (response) => {
    response.headers.set(
      "cache-control",
      "no-store, no-cache, must-revalidate",
    );
    response.headers.set("pragma", "no-cache");
    response.headers.set("expires", "0");
  });
});
