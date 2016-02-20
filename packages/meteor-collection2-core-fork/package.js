/* global Package */

Package.describe({
  name: "aldeed:collection2-core",
  summary: "Core package for aldeed:collection2",
  version: "1.0.0",
  git: "https://github.com/aldeed/meteor-collection2-core.git"
});

Package.onUse(function(api) {

  api.use('aldeed:simple-schema@1.5.3');
  api.imply('aldeed:simple-schema');

  api.use('underscore@1.0.0');
  api.use('check@1.0.0');
  api.use('mongo@1.0.4');
  api.imply('mongo');
  api.use('minimongo@1.0.0');
  api.use('ejson@1.0.0');
  api.use('raix:eventemitter@0.1.3');

  // Allow us to detect 'insecure'.
  api.use('insecure@1.0.0', {weak: true});

  api.addFiles([
    'lib/collection2.js',
  ]);

  api.export('Collection2');
});
