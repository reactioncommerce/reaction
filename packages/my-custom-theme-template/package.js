Package.describe({
  // Name of your package
  name: "my:custom-theme",

  // Brief summary or title of your package
  summary: "My Custom Theme",

  // Version number of your theme package
  version: "0.1.0"
});

Package.onUse(function (api) {
  // The package is set to work with meteor 1.2 and above
  api.versionsFrom("METEOR@1.2");

  // Use a preprocessor, LESS CSS in this case.
  api.use("less");

  // Include core theme to get its base styles.
  // The styles from core-theme are imported into the main.less file.
  // @see main.less
  // (Optional, but recommended for a starting point)
  api.use("reactioncommerce:core-theme@2.0.0");

  // ---------------------------------------------------------------------------
  // Styles that will be imported into another file.
  // -- Theses file will imported into main.less, so they are included here,
  // -- before they are include the main.less file
  //
  // ** ADD YOUR CUSTOM STYLES HERE **
  api.addFiles("styles/variables.less", "client", {isImport: true});
  api.addFiles("styles/base.less", "client", {isImport: true});


  // ---------------------------------------------------------------------------
  // Styles that stand on their own and are processed by Meteor using the proper
  // CSS preprocessor (LESS CSS in this case)
  api.addFiles("main.less", "client");
});
