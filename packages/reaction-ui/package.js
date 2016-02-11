Package.describe({
  summary: "Reaction UI - Components for Reaction Commerce",
  name: "reactioncommerce:reaction-ui",
  version: "0.5.0",
  documentation: "README.md"
});

Npm.depends({
  "classnames": "2.2.3",
  "react-textarea-autosize": "3.3.0",
  "react-color": "1.3.6",
  "sortablejs": "1.4.2",
  "react-dom": "0.14.7",
  "postcss": "5.0.14",
  "postcss-js": "0.1.1",
  "autoprefixer": "6.3.1",
  "css-annotation": "0.6.0"
  // "react-anything-sortable": "1.0.0"
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
  api.use("spacebars");
  api.use("check");
  api.use("react");
  api.use("react-template-helper");
  api.use("less");
  api.use("reactive-dict");

  // Community Packages
  api.use("cosmos:browserify@0.9.3");

  // meteor add-on packages
  api.use("reactioncommerce:core@0.12.0");
  api.use("reactioncommerce:reaction-schemas@2.0.0");

  api.addFiles("common/global.js", ["client", "server"]);
  api.addFiles("lib/client.browserify.js", "client");

  api.addFiles("client/styles/base.less", "client");

  api.addFiles("client/components/components.jsx", "client");
  api.addFiles("client/components/button/button.html", "client");
  api.addFiles("client/components/button/button.js", "client");
  api.addFiles("client/components/button/button.less", "client");

  api.addFiles("client/components/items/item.jsx", "client");
  api.addFiles("client/components/sortable/sortable.jsx", "client");
  api.addFiles("client/components/items/items.jsx", "client");
  api.addFiles("client/components/items/items.less", "client");

  api.addFiles("client/components/seperator/seperator.jsx", "client");
  api.addFiles("client/components/seperator/seperator.less", "client");

  api.addFiles("client/components/buttonGroup/buttonGroup.jsx", "client");
  api.addFiles("client/components/buttonGroup/buttonGroup.less", "client");

  // api.addFiles("client/components/numericInput/numericInput.html", "client");
  // api.addFiles("client/components/numericInput/numericInput.js", "client");

  api.addFiles("client/components/textfield/textfield.html", "client");
  api.addFiles("client/components/textfield/textfield.less", "client");

  api.addFiles("client/components/metadata/metadata.jsx", "client");
  api.addFiles("client/components/metadata/metadata.less", "client");

  api.addFiles("client/components/select/select.html", "client");
  api.addFiles("client/components/select/select.js", "client");
  api.addFiles("client/components/select/select.less", "client");

  api.addFiles("client/components/media/media.jsx", "client");
  api.addFiles("client/components/media/media.less", "client");

  api.addFiles("client/components/tags/tagItem.html", "client");
  api.addFiles("client/components/tags/tagItem.js", "client");
  api.addFiles("client/components/tags/tagList.html", "client");
  api.addFiles("client/components/tags/tagList.js", "client");

  api.addFiles("client/components/tags/tags.less", "client");
  api.export("TagList");

  // api.addFiles("client/styles/base.less", "client");
  api.addFiles("client/styles/variables.less", "client");
  api.addFiles("client/styles/rtl.less", "client");
  api.addFiles("client/styles/mixins.less", "client");


  api.addFiles("client/templates/dashboard/dashboard.html", "client");
  api.addFiles("client/templates/dashboard/dashboard.js", "client");

  api.addFiles("client/templates/settings/settings.html", "client");
  api.addFiles("client/templates/settings/settings.js", "client");
  api.addFiles("client/templates/settings/settings.less", "client");


  api.addAssets("private/themes/button.css", "server");

  api.addFiles("server/processTheme.js", "server");
  api.addFiles("server/register.js", "server");

  // Exports
  api.export("ReactionUI");
  api.export("Sortable");
});
