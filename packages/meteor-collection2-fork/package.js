/* global Package */

Package.describe({
  name: "aldeed:collection2",
  summary: "Automatic validation of insert and update operations on the client and server.",
  version: "2.8.0",
  git: "https://github.com/aldeed/meteor-collection2.git"
});

Package.onUse(function(api) {
  // Automatically include all packages for now
  api.use([
    'aldeed:collection2-core@1.0.0',
    'aldeed:schema-index@1.0.1',
    'aldeed:schema-deny@1.0.1',
  ]);
  
  api.imply([
    'aldeed:collection2-core',
    'aldeed:schema-index',
    'aldeed:schema-deny',
  ]);
});

Package.onTest(function(api) {

  api.use('aldeed:collection2');
  api.use('tinytest@1.0.0');
  api.use('test-helpers@1.0.0');
  api.use('underscore@1.0.0');
  api.use('ejson@1.0.0');
  api.use('ordered-dict@1.0.0');
  api.use('random@1.0.0');
  api.use('deps@1.0.0');
  api.use('minimongo@1.0.0');

  api.addFiles([
    'tests/schemas.js',
    'tests/collections.js',
    'tests/pubsub.js',
    'tests/security.js',
    'tests/tests.js',
    'tests/tests-deny.js',
    'tests/tests-indexing.js'
  ]);
});
