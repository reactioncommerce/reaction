Package.describe({
  summary: "Reaction Commerce Core",
  name: "reactioncommerce:core",
  version: "0.10.2",
  documentation: "README.md"
});

Npm.depends({
  "node-geocoder": "3.0.0"
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
  api.use("ddp-rate-limiter");
  api.use("underscore");
  api.use("logging");
  api.use("reload");
  api.use("random");
  api.use("ejson");
  api.use("check");
  api.use("less");
  api.use("http");
  api.use("reactive-var");
  api.use("email");
  api.use("browser-policy");
  api.use("service-configuration");
  api.use("amplify@1.0.0");
  api.use("react-template-helper@0.2.3");

  // meteor authentication packages
  api.use("oauth-encryption");
  api.use("accounts-base");
  api.use("accounts-password");

  // community packages
  api.use("mquandalle:bower@1.5.2_1");
  api.use("underscorestring:underscore.string@3.2.2");
  api.use("ongoworks:transliteration@0.1.1");
  api.use("reactioncommerce:reaction-collections@1.0.2");
  api.use("reactioncommerce:reaction-email-templates@0.1.0");
  api.use("aldeed:template-extension@4.0.0", "client");
  api.use("aldeed:autoform@5.8.1");
  api.use("iron:router@1.0.12");

  api.use("ongoworks:bunyan-logger@2.5.0");
  api.use("momentjs:moment@2.10.6");
  api.use("risul:moment-timezone@0.4.1");
  api.use("utilities:spin@2.3.1", "client");
  api.use("utilities:avatar@0.9.2");

  // imply exports package vars
  api.imply("less");
  api.imply("amplify");
  api.imply("accounts-base");
  api.imply("ecmascript");
  api.imply("es5-shim");
  api.imply("browser-policy");
  api.imply("service-configuration");
  api.imply("reactioncommerce:reaction-collections");
  api.imply("reactioncommerce:reaction-email-templates");
  api.imply("aldeed:autoform");
  api.imply("aldeed:template-extension");
  api.imply("iron:router");
  api.imply("momentjs:moment");
  api.imply("utilities:spin", ["client"]);
  api.imply("utilities:avatar");

  // reaction core dependencies
  api.use("reactioncommerce:reaction-ui@0.1.0");
  api.addFiles("lib/bower.json", "client");
  api.addFiles("lib/bower/jquery.ui/ui/core.js", "client");
  api.addFiles("lib/bower/jquery.ui/ui/widget.js", "client");
  api.addFiles("lib/bower/jquery.ui/ui/mouse.js", "client");
  api.addFiles("lib/bower/jquery.ui/ui/position.js", "client");
  api.addFiles("lib/bower/jquery.ui/ui/autocomplete.js", "client");
  api.addFiles("lib/bower/jquery.ui/ui/sortable.js", "client");
  api.addFiles("lib/bower/jquery.ui/ui/draggable.js", "client");
  api.addFiles("lib/bower/jquery.ui/ui/droppable.js", "client");
  api.addFiles("lib/bower/jquery.ui/ui/effect.js", "client");
  api.addFiles("lib/bower/jquery.ui/ui/effect-slide.js", "client");
  api.addFiles("lib/bower/jquery.ui/ui/menu.js", "client");
  api.addFiles("lib/bower/autosize/dist/autosize.js", "client");
  api.addFiles("lib/bower/openexchangerates.accounting/accounting.min.js", "client");
  api.addFiles("lib/bower/openexchangerates.money/money.js", "client");
  api.addFiles("lib/bower/jquery.tagsinput/dist/jquery.tagsinput.min.css", "client");
  api.addFiles("lib/css/jquery-ui.css", "client");
  api.addFiles("lib/geocoder.js", ["server"]);

  // exports
  api.addFiles("common/global.js");

  // init reaction core
  // import fixture data
  api.addFiles("server/logger.js", "server");
  api.addFiles("server/import.js", "server");
  api.addFiles("server/init.js", "server");
  api.addFiles("client/main.js", "client");
  api.addFiles("server/main.js", "server");
  api.addFiles("server/registry.js", "server");
  api.addFiles("server/register.js", "server");
  api.addFiles("common/common.js");

  // i18n translations
  api.addAssets("private/data/i18n/ar.json", "server");
  api.addAssets("private/data/i18n/bg.json", "server");
  api.addAssets("private/data/i18n/cn.json", "server");
  api.addAssets("private/data/i18n/cs.json", "server");
  api.addAssets("private/data/i18n/de.json", "server");
  api.addAssets("private/data/i18n/en.json", "server");
  api.addAssets("private/data/i18n/el.json", "server");
  api.addAssets("private/data/i18n/es.json", "server");
  api.addAssets("private/data/i18n/fr.json", "server");
  api.addAssets("private/data/i18n/he.json", "server");
  api.addAssets("private/data/i18n/hr.json", "server");
  api.addAssets("private/data/i18n/hu.json", "server");
  api.addAssets("private/data/i18n/it.json", "server");
  api.addAssets("private/data/i18n/my.json", "server");
  api.addAssets("private/data/i18n/nl.json", "server");
  api.addAssets("private/data/i18n/pl.json", "server");
  api.addAssets("private/data/i18n/pt.json", "server");
  api.addAssets("private/data/i18n/ru.json", "server");
  api.addAssets("private/data/i18n/sl.json", "server");
  api.addAssets("private/data/i18n/sv.json", "server");
  api.addAssets("private/data/i18n/tr.json", "server");
  api.addAssets("private/data/i18n/vi.json", "server");
  api.addAssets("private/data/i18n/nb.json", "server");

  // security
  api.addFiles("server/browserPolicy.js", "server");

  // cron jobs
  api.addFiles("server/jobs.js", "server");

  // common
  api.addFiles("common/router.js");

  api.addFiles("common/methods/layout.js");
  api.addFiles("common/methods/workflow.js");
  api.addFiles("common/methods/cart.js");

  // methods
  api.addFiles("server/methods/cart.js", "server");
  api.addFiles("server/methods/orders.js", "server");
  api.addFiles("server/methods/products.js", "server");
  api.addFiles("server/methods/shipping.js", "server");
  api.addFiles("server/methods/shop.js", "server");

  // method hooks
  api.addFiles("server/methods/hooks/hooks.js");
  api.addFiles("server/methods/hooks/cart.js", "server");

  // client
  api.addFiles("client/subscriptions.js", "client");
  api.addFiles("client/helpers/layout.js", "client");
  api.addFiles("client/helpers/packages.js", "client");
  api.addFiles("client/helpers/cart.js", "client");
  api.addFiles("client/helpers/globals.js", "client");
  api.addFiles("client/helpers/products.js", "client");
  api.addFiles("client/helpers/i18n.js", "client");
  api.addFiles("client/helpers/metadata.js", "client");
  api.addFiles("client/helpers/permissions.js", "client");
  api.addFiles("client/helpers/utilities.js", "client");

  api.addFiles("client/components/numericInput/numericInput.html", "client");
  api.addFiles("client/components/numericInput/numericInput.js", "client");

  api.addFiles("client/templates/layout/layout.html", "client");
  api.addFiles("client/templates/layout/layout.js", "client");

  api.addFiles("client/templates/layout/admin/admin.html", "client");
  api.addFiles("client/templates/layout/admin/admin.js", "client");

  api.addFiles("client/templates/layout/header/header.html", "client");
  api.addFiles("client/templates/layout/header/header.js", "client");

  api.addFiles("client/templates/layout/header/menu/button.html", "client");

  api.addFiles("client/templates/layout/header/i18n/i18n.html", "client");
  api.addFiles("client/templates/layout/header/i18n/i18n.js", "client");

  api.addFiles("client/templates/layout/header/brand/brand.html", "client");

  api.addFiles("client/templates/layout/footer/footer.html", "client");

  api.addFiles("client/templates/layout/alerts/bootstrapAlerts.js", "client");
  api.addFiles("client/templates/layout/alerts/alerts.html", "client");
  api.addFiles("client/templates/layout/alerts/alerts.js", "client");

  api.addFiles("client/templates/layout/loading/loading.html", "client");
  api.addFiles("client/templates/layout/notFound/notFound.html", "client");

  api.addFiles("client/templates/layout/notice/unauthorized.html", "client");
  api.addFiles("client/templates/layout/notice/shopNotFound.html", "client");

  api.addFiles("client/templates/cart/cartDrawer/cartDrawer.html", "client");
  api.addFiles("client/templates/cart/cartDrawer/cartDrawer.js", "client");

  api.addFiles("client/templates/cart/cartDrawer/cartItems/cartItems.html", "client");
  api.addFiles("client/templates/cart/cartDrawer/cartItems/cartItems.js", "client");

  api.addFiles("client/templates/cart/cartDrawer/cartSubTotals/cartSubTotals.html", "client");
  api.addFiles("client/templates/cart/cartDrawer/cartSubTotals/cartSubTotals.js", "client");

  api.addFiles("client/templates/cart/cartIcon/cartIcon.html", "client");
  api.addFiles("client/templates/cart/cartIcon/cartIcon.js", "client");

  api.addFiles("client/templates/cart/cartPanel/cartPanel.html", "client");
  api.addFiles("client/templates/cart/cartPanel/cartPanel.js", "client");

  api.addFiles("client/templates/cart/checkout/checkout.html", "client");
  api.addFiles("client/templates/cart/checkout/checkout.js", "client");

  api.addFiles("client/templates/cart/checkout/header/header.html", "client");

  api.addFiles("client/templates/cart/checkout/login/login.html", "client");
  api.addFiles("client/templates/cart/checkout/login/login.js", "client");

  api.addFiles("client/templates/cart/checkout/progressBar/progressBar.html", "client");
  api.addFiles("client/templates/cart/checkout/progressBar/progressBar.js", "client");

  api.addFiles("client/templates/cart/checkout/review/review.html", "client");
  api.addFiles("client/templates/cart/checkout/review/review.js", "client");

  api.addFiles("client/templates/cart/checkout/payment/payment.html", "client");
  api.addFiles("client/templates/cart/checkout/payment/methods/cards.html", "client");
  api.addFiles("client/templates/cart/checkout/payment/methods/cards.js", "client");

  api.addFiles("client/templates/cart/checkout/completed/completed.html", "client");
  api.addFiles("client/templates/cart/checkout/completed/completed.js", "client");

  api.addFiles("client/templates/cart/checkout/shipping/shipping.html", "client");
  api.addFiles("client/templates/cart/checkout/shipping/shipping.js", "client");

  api.addFiles("client/templates/cart/checkout/addressBook/addressBook.html", "client");
  api.addFiles("client/templates/cart/checkout/addressBook/addressBook.js", "client");

  api.addFiles("client/templates/dashboard/console/console.html", "client");
  api.addFiles("client/templates/dashboard/console/console.js", "client");

  api.addFiles("client/templates/dashboard/console/icon/icon.html", "client");
  api.addFiles("client/templates/dashboard/console/icon/icon.js", "client");

  api.addFiles("client/templates/dashboard/import/import.html", "client");
  api.addFiles("client/templates/dashboard/import/import.js", "client");

  api.addFiles("client/templates/dashboard/orders/orders.html", "client");
  api.addFiles("client/templates/dashboard/orders/orders.js", "client");

  api.addFiles("client/templates/dashboard/orders/orderPage/orderPage.html", "client");
  api.addFiles("client/templates/dashboard/orders/orderPage/orderPage.js", "client");

  api.addFiles("client/templates/dashboard/orders/orderPage/details/details.html", "client");
  api.addFiles("client/templates/dashboard/orders/orderPage/details/details.js", "client");

  api.addFiles("client/templates/dashboard/orders/list/ordersList.html", "client");
  api.addFiles("client/templates/dashboard/orders/list/ordersList.js", "client");

  api.addFiles("client/templates/dashboard/orders/list/items/items.html", "client");
  api.addFiles("client/templates/dashboard/orders/list/items/items.js", "client");

  api.addFiles("client/templates/dashboard/orders/list/summary/summary.html", "client");
  api.addFiles("client/templates/dashboard/orders/list/summary/summary.js", "client");

  api.addFiles("client/templates/dashboard/orders/list/pdf/pdf.html", "client");
  api.addFiles("client/templates/dashboard/orders/list/pdf/pdf.js", "client");

  api.addFiles("client/templates/dashboard/orders/widget/widget.html", "client");
  api.addFiles("client/templates/dashboard/orders/widget/widget.js", "client");

  api.addFiles("client/templates/dashboard/orders/details/detail.html", "client");
  api.addFiles("client/templates/dashboard/orders/details/detail.js", "client");

  api.addFiles("client/templates/dashboard/orders/social/orderSocial.html", "client");

  api.addFiles("client/templates/dashboard/orders/workflow/workflow.html", "client");
  api.addFiles("client/templates/dashboard/orders/workflow/workflow.js", "client");

  api.addFiles("client/templates/dashboard/orders/workflow/orderSummary/orderSummary.html", "client");

  api.addFiles("client/templates/dashboard/orders/workflow/orderCompleted/orderCompleted.html", "client");

  api.addFiles("client/templates/dashboard/orders/workflow/shippingSummary/shippingSummary.html", "client");
  api.addFiles("client/templates/dashboard/orders/workflow/shippingSummary/shippingSummary.js", "client");

  api.addFiles("client/templates/dashboard/orders/workflow/shippingInvoice/shippingInvoice.html", "client");
  api.addFiles("client/templates/dashboard/orders/workflow/shippingInvoice/shippingInvoice.js", "client");

  api.addFiles("client/templates/dashboard/orders/workflow/shippingTracking/shippingTracking.html", "client");
  api.addFiles("client/templates/dashboard/orders/workflow/shippingTracking/shippingTracking.js", "client");

  api.addFiles("client/templates/dashboard/packages/packages.html", "client");

  api.addFiles("client/templates/dashboard/packages/grid/package/package.html", "client");
  api.addFiles("client/templates/dashboard/packages/grid/package/package.js", "client");

  api.addFiles("client/templates/dashboard/packages/grid/grid.html", "client");
  api.addFiles("client/templates/dashboard/packages/grid/grid.js", "client");

  api.addFiles("client/templates/dashboard/dashboard.html", "client");
  api.addFiles("client/templates/dashboard/dashboard.js", "client");

  api.addFiles("client/templates/dashboard/settings/settings.html", "client");
  api.addFiles("client/templates/dashboard/settings/settings.js", "client");

  api.addFiles("client/templates/dashboard/shop/settings/settings.html", "client");
  api.addFiles("client/templates/dashboard/shop/settings/settings.js", "client");

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
  api.export("ReactionCore");
  api.export("ReactionImport");
  api.export("ReactionRegistry", "server");
  // legacy Exports (TODO: move to ReactionCore)
  api.export("Alerts", ["client"]);
  api.export("currentProduct", ["client", "server"]);
});


Package.onTest(function (api) {
  api.use("underscore");
  api.use("random");
  api.use("sanjo:jasmine@0.20.3");
  api.use("velocity:html-reporter@0.9.1");
  api.use("velocity:console-reporter@0.1.4");

  api.use("accounts-base");
  api.use("accounts-password");

  // reaction core
  api.use("reactioncommerce:reaction-collections@1.0.2");
  api.use("reactioncommerce:reaction-factories@0.3.2");
  api.use("reactioncommerce:core@0.10.0");

  // server integration tests
  api.addFiles("tests/jasmine/server/integration/methods.js", "server");
  api.addFiles("tests/jasmine/server/integration/shops.js", "server");
  api.addFiles("tests/jasmine/server/integration/products.js", "server");
  api.addFiles("tests/jasmine/server/integration/cart.js", "server");
  api.export("faker", ["server"]);
});
