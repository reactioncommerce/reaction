Package.describe({
  summary: "Reaction Logger - core logging libs for Reaction Commerce",
  name: "reactioncommerce:reaction-logger",
  documentation: "README.md",
  version: "0.1.0"
});

Package.onUse(function(api) {
  api.versionsFrom("METEOR@1.2");

  Npm.depends({
    "bunyan": "1.7.1",
    "bunyan-format": "0.2.1",
    "bunyan-loggly": "0.0.5"
  });

  api.use([
    "ecmascript",
    "underscore",
    "cosmos:browserify@0.10.0"
  ]);

  api.addFiles([
    "client/bunyan.browserify.js"
  ], "client");

  api.addFiles([
    "server/main.js"
  ], "server");

  api.export("bunyan", "client");
  api.export("Logger", "server");
});

Package.onTest(function(api) {
  api.use("tinytest", "client");
  api.addFiles("tests/bunyan-test.js", "client");
});
