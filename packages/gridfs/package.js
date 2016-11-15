Package.describe({
  name: "cfs:gridfs",
  version: "0.0.34",
  summary: "GridFS storage adapter for CollectionFS",
  git: "https://github.com/CollectionFS/Meteor-cfs-gridfs.git"
});

Npm.depends({
  "mongodb": "2.2.9",
  "gridfs-stream": "1.1.1"
});

Package.onUse(function (api) {
  api.versionsFrom("1.0");

  api.use(["cfs:base-package@0.0.30", "cfs:storage-adapter@0.2.1", "ecmascript"]);
  api.addFiles("gridfs.server.js", "server");
  api.addFiles("gridfs.client.js", "client");
});

Package.onTest(function (api) {
  api.use(["cfs:gridfs", "test-helpers", "tinytest"], "server");
  api.addFiles("tests/server-tests.js", "server");
  api.addFiles("tests/client-tests.js", "client");
});
