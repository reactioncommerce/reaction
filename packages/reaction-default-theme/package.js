Package.describe({
  name: "reactioncommerce:default-theme",
  summary: "Reaction Commerce Default theme",
  version: "1.0.5"
});

Package.onUse(function (api) {
  // Works with meteor 1.2 and above
  api.versionsFrom("METEOR@1.3");

  // Using less only for this theme
  api.use("less");
  api.use("fortawesome:fontawesome@4.5.0");

  // Include core theme to get its base styles
  api.use("reactioncommerce:core-theme@2.0.2");

  // Add top level .less files
  api.addFiles([
    "main.less"
  ], "client");
});
