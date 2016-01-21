Package.describe({
  summary: "Reaction UI Tag Navigation - Tag navigation bars and trees",
  name: "reactioncommerce:reaction-ui-tagnav",
  version: "0.1.0",
  documentation: "README.md"
});

// Npm.depends({
//   "classnames": "2.2.0",
//   "react-textarea-autosize": "3.1.0",
//   "sortablejs": "1.4.2",
//   "react-dom": "0.14.1"
//   // "react-anything-sortable": "1.0.0"
// });

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
  api.use("react");
  api.use("less");
  api.use("reactive-dict");

  // Community Packages
  // api.use("cosmos:browserify@0.9.0");

  // meteor add-on packages
  // api.use("reactioncommerce:core@0.9.4");
  api.use("reactioncommerce:reaction-schemas@1.0.1");
  api.use("reactioncommerce:reaction-ui@0.1.0");
  api.use("reactioncommerce:core-theme@2.0.0");


  // api.addFiles("lib/client.browserify.js", "client");

  // api.addFiles("client/styles/base.less", "client");

  // api.addFiles("server/register.js", ["server"]); // register as a reaction package
  // api.addFiles("server/stripe.js", ["server"]);

  api.addFiles("client/components/components.jsx", "client");
  api.addFiles("client/helpers/helpers.js", "client");
  api.addFiles("client/helpers/tags.js", "client");
  // api.export("ReactionUI");
  // api.export("Sortable");

  api.addFiles("client/components/tagGroup/tagGroup.jsx", "client");
  api.addFiles("client/components/tagGroup/tagGroup.html", "client");
  api.addFiles("client/components/tagGroup/tagGroup.js", "client");
  api.addFiles("client/components/tagGroup/tagGroup.less", "client");

  api.addFiles("client/components/tagTree/tagTree.jsx", "client");
  api.addFiles("client/components/tagTree/tagTree.html", "client");
  api.addFiles("client/components/tagTree/tagTree.js", "client");
  api.addFiles("client/components/tagTree/tagTree.less", "client");

  // api.addFiles("client/components/tagNav/tagNav.jsx", "client");

  api.addFiles("client/components/tagNav/tagNav.html", "client");
  api.addFiles("client/components/tagNav/tagNav.js", "client");
  api.addFiles("client/components/tagNav/tagNav.less", "client");




  // api.export("TagList");

  api.addFiles("client/styles/base.less", "client");
  // api.addFiles("client/styles/variables.less", "client");
  // api.addFiles("client/styles/rtl.less", "client");
  // api.addFiles("client/styles/mixins.less", "client");
});
