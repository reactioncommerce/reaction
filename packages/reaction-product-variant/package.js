Package.describe({
  summary: "Basic Reaction Product with Variants",
  name: "reactioncommerce:reaction-product-variant",
  version: "0.1.0",
  documentation: "README.md"
});

Package.onUse(function (api) {
  api.versionsFrom("METEOR@1.2.1");

  // meteor base packages
  api.use("meteor-base");
  api.use("mongo");
  api.use("ecmascript");
  api.use("es5-shim");
  api.use("blaze-html-templates");
  api.use("session");
  api.use("jquery");
  api.use("tracker");

  // meteor add-on packages
  api.use("underscore");
  api.use("logging");
  api.use("reload");
  api.use("random");
  api.use("ejson");
  api.use("check");
  api.use("http");
  api.use("reactive-var");
  api.use("reactive-dict");

  // community packages
  api.use("reactioncommerce:core@0.12.0");

  // Product Templates
  api.addFiles("client/templates/products/products.html", "client");
  api.addFiles("client/templates/products/products.js", "client");

  api.addFiles("client/templates/products/productList/productList.html", "client");
  api.addFiles("client/templates/products/productList/productList.js", "client");

  api.addFiles("client/templates/products/productGrid/content/content.html", "client");
  api.addFiles("client/templates/products/productGrid/content/content.js", "client");

  api.addFiles("client/templates/products/productGrid/notice/notice.html", "client");
  api.addFiles("client/templates/products/productGrid/notice/notice.js", "client");

  api.addFiles("client/templates/products/productGrid/controls/controls.html", "client");
  api.addFiles("client/templates/products/productGrid/controls/controls.js", "client");

  api.addFiles("client/templates/products/productGrid/item/item.html", "client");
  api.addFiles("client/templates/products/productGrid/item/item.js", "client");

  api.addFiles("client/templates/products/productGrid/productGrid.html", "client");
  api.addFiles("client/templates/products/productGrid/productGrid.js", "client");

  api.addFiles("client/templates/products/productDetail/productDetail.html", "client");
  api.addFiles("client/templates/products/productDetail/productDetail.js", "client");

  api.addFiles("client/templates/products/productDetail/edit/edit.html", "client");
  api.addFiles("client/templates/products/productDetail/edit/edit.js", "client");

  api.addFiles("client/templates/products/productDetail/images/productImageGallery.html", "client");
  api.addFiles("client/templates/products/productDetail/images/productImageGallery.js", "client");

  api.addFiles("client/templates/products/productDetail/tags/tags.html", "client");
  api.addFiles("client/templates/products/productDetail/tags/tags.js", "client");

  api.addFiles("client/templates/products/productDetail/social/social.html", "client");
  api.addFiles("client/templates/products/productDetail/social/social.js", "client");

  api.addFiles("client/templates/products/productDetail/variants/variant.html", "client");
  api.addFiles("client/templates/products/productDetail/variants/variant.js", "client");

  api.addFiles("client/templates/products/productDetail/variants/variantList/variantList.html", "client");
  api.addFiles("client/templates/products/productDetail/variants/variantList/variantList.js", "client");

  api.addFiles("client/templates/products/productDetail/variants/variantForm/variantForm.html", "client");
  api.addFiles("client/templates/products/productDetail/variants/variantForm/variantForm.js", "client");

  api.addFiles("client/templates/products/productDetail/variants/variantForm/childVariant/childVariant.html", "client");
  api.addFiles("client/templates/products/productDetail/variants/variantForm/childVariant/childVariant.js", "client");

  api.addFiles("client/templates/products/productDetail/attributes/attributes.html", "client");
  api.addFiles("client/templates/products/productDetail/attributes/attributes.js", "client");

  api.addFiles("client/templates/products/productSettings/productSettings.html", "client");
  api.addFiles("client/templates/products/productSettings/productSettings.js", "client");

  // Exports
  api.export("currentProduct", ["client", "server"]);
});

//
// Package.onTest(function (api) {
//   api.use("underscore");
//   api.use("random");
//   api.use("sanjo:jasmine@0.21.0");
//   api.use("velocity:html-reporter@0.9.1");
//   api.use("velocity:console-reporter@0.1.4");
//
//   api.use("accounts-base");
//   api.use("accounts-password");
//
//   // reaction core
//   api.use("reactioncommerce:reaction-collections@1.0.5");
//   api.use("reactioncommerce:reaction-factories@0.3.7");
//   api.use("reactioncommerce:core@0.12.0");
//
//   // server integration tests
//   api.addFiles("tests/jasmine/server/integration/products.js", "server");
//
//   api.export("faker", ["server"]);
// });
