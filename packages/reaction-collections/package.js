Package.describe({
  summary: "Reaction Collections - core collections + hooks, cfs, jobs",
  name: "reactioncommerce:reaction-collections",
  documentation: "README.md",
  version: "1.0.2"
});

Package.onUse(function (api) {
  api.versionsFrom("METEOR@1.2");
  api.use("random");
  api.use("underscore");
  api.use("ecmascript");

  api.use("reactioncommerce:reaction-schemas@1.0.2");
  api.use("cfs:standard-packages@0.5.9");
  api.use("cfs:storage-adapter@0.2.3");
  api.use("cfs:graphicsmagick@0.0.18");
  api.use("cfs:gridfs@0.0.33");
  api.use("cfs:filesystem@0.1.2");
  api.use("cfs:ui@0.1.3");
  api.use("raix:ui-dropped-event@0.0.7");
  api.use("vsivsi:job-collection@1.2.3");
  // ReactionCore declaration
  api.addFiles("common/globals.js");

  // collections
  api.addFiles("common/collections/collections.js");
  api.addFiles("common/collections/collectionFS.js");

  // collection hooks
  api.addFiles("common/collections/hooks/hooks.js");


  api.imply("cfs:standard-packages");
  api.imply("cfs:storage-adapter");
  api.imply("cfs:graphicsmagick");
  api.imply("cfs:filesystem");
  api.imply("cfs:gridfs");
  api.imply("raix:ui-dropped-event");
  api.imply("vsivsi:job-collection");

  // ensure schemas vars are passed through
  // api.imply("reactioncommerce:reaction-schemas");
  api.export("ReactionCore");
  api.export("getSlug");
});
