Package.describe({
  summary: "Reaction UI Tag Navigation - Tag navigation bars and trees",
  name: "reactioncommerce:reaction-ui-tagnav",
  version: "0.1.0",
  documentation: "README.md"
});

Package.onUse(function (api) {
  api.versionsFrom("METEOR@1.2");

  // meteor base packages
  api.use("meteor-base");
  api.use("mongo");
  api.use("blaze-html-templates");
  api.use("session");
  api.use("jquery");
  api.use("tracker");
  api.use("logging");
  api.use("reload");
  api.use("random");
  api.use("ejson");
  api.use("ecmascript");
  api.use("spacebars");
  api.use("check");
  api.use("less");
  api.use("reactive-dict");

  // meteor add-on packages
  api.use("reactioncommerce:reaction-schemas@2.0.3");
  api.use("reactioncommerce:reaction-ui@0.1.0");
  api.use("reactioncommerce:core-theme@2.0.0");

  api.addFiles("client/components/components.js", "client");
  api.addFiles("client/helpers/helpers.js", "client");
  api.addFiles("client/helpers/tags.js", "client");

  api.addFiles("client/components/tagGroup/tagGroup.html", "client");
  api.addFiles("client/components/tagGroup/tagGroup.js", "client");
  api.addFiles("client/components/tagGroup/tagGroup.less", "client");

  api.addFiles("client/components/tagTree/tagTree.html", "client");
  api.addFiles("client/components/tagTree/tagTree.js", "client");
  api.addFiles("client/components/tagTree/tagTree.less", "client");

  api.addFiles("client/components/tagNav/tagNav.html", "client");
  api.addFiles("client/components/tagNav/tagNav.js", "client");
  api.addFiles("client/components/tagNav/tagNav.less", "client");

  api.addFiles("client/styles/base.less", "client");
});
