Package.describe({
  name: "reactioncommerce:default-theme",
  summary: "Reaction Commerce Default theme",
  version: "1.0.3"
});

Package.onUse(function (api) {
  // Works with meteor 1.2 and above
  api.versionsFrom("METEOR@1.2");

  // Using less only for this theme
  api.use("less");

  // Include core theme to get its base styles
  api.use("reactioncommerce:core-theme@2.0.1");

  // Add top level .less files
  api.addFiles([
    "main.less"
  ], "client");
});
