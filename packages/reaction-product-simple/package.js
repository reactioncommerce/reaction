Package.describe({
  summary: "Reaction Product - Simple",
  name: "reactioncommerce:reaction-product-simple",
  version: "0.1.1",
  documentation: "README.md"
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
  api.use("react@0.14.1_1");
  api.use("react-template-helper@0.2.3");

  // meteor add-on packages

  api.use("less");
  api.use("reactioncommerce:core@0.12.0");
  api.use("reactioncommerce:reaction-ui@0.1.0");

  api.addFiles("server/register.js", ["server"]); // register as a reaction package
  // api.addFiles("server/stripe.js", ["server"]);

  // api.addFiles([
  //   "common/collections.js",
  //   "common/routing.js",
  //   "lib/stripe.js"
  // ], ["client", "server"]);

  // api.addFiles("client/templates/products/products.html", "client");
  // api.addFiles("client/templates/products/products.js", "client");

  // api.addFiles("client/templates/productList/productList.html", "client");
  // api.addFiles("client/templates/productList/productList.js", "client");

  // api.addFiles("client/templates/productGrid/productGrid.html", "client");
  // api.addFiles("client/templates/productGrid/productGrid.js", "client");
  //
  api.addFiles("client/helpers/product.js", "client");


  api.addFiles("client/components/components.jsx", "client");
  api.export("ReactionProductSimple");

  api.addFiles("client/components/media/media.jsx", "client");



  api.addFiles("client/templates/productDetail/settings/settings.html", "client");
  api.addFiles("client/templates/productDetail/settings/settings.js", "client");

  api.addFiles("client/templates/productDetail/edit/edit.html", "client");
  api.addFiles("client/templates/productDetail/edit/edit.js", "client");

  api.addFiles("client/templates/productDetail/images/productImageGallery.html", "client");
  api.addFiles("client/templates/productDetail/images/productImageGallery.js", "client");

  api.addFiles("client/templates/productDetail/tags/tags.html", "client");
  api.addFiles("client/templates/productDetail/tags/tags.js", "client");

  api.addFiles("client/templates/productDetail/social/social.html", "client");
  api.addFiles("client/templates/productDetail/social/social.js", "client");

  api.addFiles("client/components/variant/variant.html", "client");
  api.addFiles("client/components/variant/variant.js", "client");
  api.addFiles("client/components/variant/variant.jsx", "client");
  api.addFiles("client/components/variant/variant.less", "client");

  api.addFiles("client/templates/productDetail/variants/variantList/variantList.html", "client");
  api.addFiles("client/templates/productDetail/variants/variantList/variantList.js", "client");
  api.addFiles("client/components/variantSelector/variantSelector.jsx", "client");

  api.addFiles("client/templates/productDetail/variants/variantForm/variantForm.html", "client");
  api.addFiles("client/templates/productDetail/variants/variantForm/variantForm.js", "client");

  api.addFiles("client/templates/productDetail/variants/variantForm/inventoryVariant/inventoryVariant.html", "client");
  api.addFiles("client/templates/productDetail/variants/variantForm/inventoryVariant/inventoryVariant.js", "client");

  api.addFiles("client/templates/productDetail/variants/variantForm/childVariant/childVariant.html", "client");
  api.addFiles("client/templates/productDetail/variants/variantForm/childVariant/childVariant.js", "client");

  api.addFiles("client/templates/productDetail/attributes/attributes.html", "client");
  api.addFiles("client/templates/productDetail/attributes/attributes.js", "client");

  api.addFiles("client/templates/productSettings/productSettings.html", "client");
  api.addFiles("client/templates/productSettings/productSettings.js", "client");


  api.addFiles("client/templates/productDetail/productDetail.html", "client");
  api.addFiles("client/templates/productDetail/productDetail.js", "client");
  api.addFiles("client/templates/productDetail/productDetail.jsx", "client");
  api.addFiles("client/templates/productDetail/productDetail.less", "client");


  api.export("ReactionSimpleProduct");
});
