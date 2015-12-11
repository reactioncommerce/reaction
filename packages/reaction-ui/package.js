Package.describe({
  summary: "Reaction UI - Components for Reaction Commerce",
  name: "reactioncommerce:reaction-ui",
  version: "0.1.0",
  documentation: "README.md"
});

Npm.depends({
  "classnames": "2.2.0",
  "react-textarea-autosize": "3.1.0",
  "sortablejs": "1.4.2",
  "react-dom": "0.14.1"
  // "react-anything-sortable": "1.0.0"
});

Package.onUse(function (api) {
  api.versionsFrom("METEOR@1.2");

  // meteor base packages
  api.use("standard-minifiers");
  api.use("mobile-experience");
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
  api.use("spacebars");
  api.use("check");
  api.use("react");
  api.use("less");

  // Community Packages
  api.use("cosmos:browserify@0.9.0");

  // meteor add-on packages
  // api.use("reactioncommerce:core@0.9.4");
  api.use("reactioncommerce:reaction-schemas@1.0.1");

  api.addFiles("lib/client.browserify.js", "client");

  api.addFiles("client/styles/base.less", "client");

  // api.addFiles("server/register.js", ["server"]); // register as a reaction package
  // api.addFiles("server/stripe.js", ["server"]);

  api.addFiles("client/components/components.jsx", "client");
  api.export("ReactionUI");
  api.export("Sortable");

  api.addFiles("client/components/button/button.jsx", "client");
  api.addFiles("client/components/button/button.less", "client");

  api.addFiles("client/components/items/item.jsx", "client");
  api.addFiles("client/components/sortable/sortable.jsx", "client");
  api.addFiles("client/components/items/items.jsx", "client");
  api.addFiles("client/components/items/items.less", "client");


  // api.addFiles("client/components/sortable/sortable.less", "client");

  api.addFiles("client/components/seperator/seperator.jsx", "client");
  api.addFiles("client/components/seperator/seperator.less", "client");


  api.addFiles("client/components/buttonGroup/buttonGroup.jsx", "client");
  api.addFiles("client/components/buttonGroup/buttonGroup.less", "client");

  // api.addFiles("client/components/numericInput/numericInput.html", "client");
  // api.addFiles("client/components/numericInput/numericInput.js", "client");

  api.addFiles("client/components/textfield/textfield.jsx", "client");
  api.addFiles("client/components/textfield/textfield.less", "client");
  api.export("TextField");

  api.addFiles("client/components/metadata/metadata.jsx", "client");
  api.addFiles("client/components/metadata/metadata.less", "client");


  api.addFiles("client/components/media/media.jsx", "client");
  api.addFiles("client/components/media/media.less", "client");

  api.addFiles("client/components/tags/tag.jsx", "client");
  api.addFiles("client/components/tags/tags.jsx", "client");
  api.addFiles("client/components/tags/tags.less", "client");
  api.export("TagList");

  // api.addFiles("client/styles/base.less", "client");
  api.addFiles("client/styles/variables.less", "client");
  api.addFiles("client/styles/rtl.less", "client");
  api.addFiles("client/styles/mixins.less", "client");
});
