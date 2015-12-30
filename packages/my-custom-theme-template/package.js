Package.describe({
  name: "my:custom-theme",
  summary: "My Custom Theme",
  version: "0.1.0"
});

Package.onUse(function (api) {
  // Works with meteor 1.2 and above
  api.versionsFrom("METEOR@1.2");

  // Use a preprocessor
  api.use("less");

  // Include core theme to get its base styles
  // (Optional, but recommended for a starting point)
  api.use("reactioncommerce:core-theme@2.0.0");

  // Add files what will be imported into your theme.less file
  // ** Please note: {isImport: true} stops meteor from processing a file with its
  // build system. This is helpful if the file needs to imported into another file.
  // In this case, these files are imported into main.less

  // (Array of files)
  api.addFiles([
    "styles/base.less"
  ], "client", {isImport: true});

  // - OR Individually, if you prefer
  // api.addFiles("/path/to/file.less", "client", {isImport: true});

  // Add top level .less files
  // These will be processed by your included preprocessors (less, styles, or sass)
  api.addFiles([
    "main.less"
  ], "client");
});
