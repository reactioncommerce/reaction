Package.describe({
  summary: "Core - Reaction Commerce ecommerce Meteor package",
  name: "reactioncommerce:core",
  version: "0.7.0",
  git: "https://github.com/reactioncommerce/reaction-core.git"
});

Package.onUse(function (api) {
  api.versionsFrom('METEOR@1.0');

  //core meteor packages
  api.use("meteor-platform");
  api.use("oauth-encryption");
  api.use("accounts-base");
  api.use("accounts-password");
  api.use("less");
  api.use("http");
  api.use("coffeescript");
  api.use("underscore");
  api.use("blaze");
  api.use("jquery");
  api.use("email");
  api.use("check");
  api.use("browser-policy");
  api.use("reactive-var");
  api.use("service-configuration");
  api.use("amplify@1.0.0");

  //community packages
  api.use("mquandalle:bower@1.4.1_1");
  api.use("d3js:d3@3.5.5");
  api.use("mrt:underscore-string-latest@2.3.3");
  api.use("aldeed:geocoder@0.3.6");
  api.use("aldeed:autoform@5.3.2");
  api.use("aldeed:collection2@2.3.3");
  api.use("aldeed:simple-schema@1.3.3");
  api.use("aldeed:template-extension@3.4.3", 'client');
  api.use("iron:router@1.0.9");
  api.use("ongoworks:speakingurl@5.0.1");
  api.use("ongoworks:bunyan-logger@2.5.0");
  api.use("ongoworks:security@1.2.0");

  api.use("dburles:factory@0.3.10");
  api.use("anti:fake@0.4.1");
  api.use("matb33:collection-hooks@0.7.13");
  api.use("alanning:roles@1.2.13");
  api.use("momentjs:moment@2.10.6", 'client');
  api.use("risul:moment-timezone@0.4.0",'client');
  api.use("utilities:spin@2.3.1", "client");
  api.use("utilities:avatar@0.8.2");

  api.use("cfs:standard-packages@0.5.9");
  api.use("cfs:storage-adapter@0.2.2");
  api.use("cfs:graphicsmagick@0.0.18");
  api.use("cfs:gridfs@0.0.33");
  api.use("cfs:filesystem@0.1.2");
  api.use("cfs:ui@0.1.3");
  api.use("raix:ui-dropped-event@0.0.7");
  api.use("meteorhacks:ssr@2.1.2");

  //implying these are reused in reaction packages
  api.imply("less");
  api.imply("amplify");
  api.imply("accounts-base");
  api.imply("ui");
  api.imply("browser-policy");
  api.imply("service-configuration");
  api.imply("mquandalle:bower");
  api.imply("aldeed:collection2");
  api.imply("aldeed:simple-schema");
  api.imply("aldeed:autoform");
  api.imply("aldeed:template-extension");
  api.imply("iron:router");
  api.imply("cfs:graphicsmagick");
  api.imply("cfs:filesystem");
  api.imply("cfs:gridfs");
  api.imply("raix:ui-dropped-event");
  api.imply("matb33:collection-hooks");
  api.imply("alanning:roles");
  api.imply("momentjs:moment", ["client"]);
  api.imply("utilities:spin", ["client"]);
  api.imply("utilities:avatar");
  api.imply("dburles:factory");
  api.imply("anti:fake");
  api.imply("ongoworks:speakingurl");
  api.imply("ongoworks:security");

  // Core Reaction files
  api.addFiles("lib/bower.json","client");
  api.addFiles([
    "common/packageGlobals.js",
    "common/common.coffee",
    "common/helpers.coffee",
    "common/routing.coffee",
    "common/schemas/packages.coffee",
    "common/schemas/accounts.coffee",
    "common/schemas/shops.coffee",
    "common/schemas/shipping.coffee",
    "common/schemas/products.coffee",
    "common/schemas/tags.coffee",
    "common/schemas/cart.coffee",
    "common/schemas/orders.coffee",
    "common/schemas/translations.coffee",
    "common/schemas/taxes.coffee",
    "common/schemas/discounts.coffee",
    "common/collections/collections.coffee",
    "common/collections/collectionFS.coffee",
    "common/hooks/hooks.coffee",
    "common/methods/cart.js"
  ], ["client", "server"]);

  api.addFiles([
    "server/app.js",
    "server/browserPolicy.js",
    "server/register.js",
    "server/security.js",
    "server/publications.js",
    "server/factories/shops.js",
    "server/factories/accounts.js",
    "server/factories/cart.js",
    "server/factories/orders.js",
    "server/factories/products.js",
    "server/fixtures.js",
    "server/methods/accounts.js",
    "server/methods/cart.js",
    "server/methods/hooks.js",
    "server/methods/orders.js",
    "server/methods/products.js",
    "server/methods/shop.js",
    "server/methods/shipping.js"
  ], ["server"]);

  api.addFiles([
    // "lib/bower/packery/index.js",
    "lib/bower/jquery.ui/ui/core.js",
    "lib/bower/jquery.ui/ui/widget.js",
    "lib/bower/jquery.ui/ui/mouse.js",
    "lib/bower/jquery.ui/ui/position.js",
    "lib/bower/jquery.ui/ui/autocomplete.js",
    "lib/bower/jquery.ui/ui/sortable.js",
    "lib/bower/jquery.ui/ui/draggable.js",
    "lib/bower/jquery.ui/ui/droppable.js",
    "lib/bower/jquery.ui/ui/effect.js",
    "lib/bower/jquery.ui/ui/effect-slide.js",
    "lib/bower/jquery.ui/ui/menu.js",
    "lib/bower/autosize/dist/autosize.js",
    "lib/bower/openexchangerates.accounting/accounting.min.js",
    "lib/bower/openexchangerates.money/money.js",
    "lib/bower/jquery.tagsinput/dist/jquery.tagsinput.min.css",
    "lib/css/jquery-ui.css",

    "client/subscriptions.coffee",
    "client/app.coffee",

    "client/helpers/apps.coffee",
    "client/helpers/cart.coffee",
    "client/helpers/globals.coffee",
    "client/helpers/i18n.coffee",
    "client/helpers/metadata.coffee",
    "client/helpers/permissions.coffee",
    "client/helpers/utilities.coffee",

    "client/templates/layout/layout.html",
    "client/templates/layout/layout.coffee",

    "client/templates/layout/header/header.html",
    "client/templates/layout/header/header.coffee",

    "client/templates/layout/header/tags/tags.html",
    "client/templates/layout/header/tags/tags.coffee",

    "client/templates/layout/header/i18n/i18n.html",
    "client/templates/layout/header/i18n/i18n.coffee",

    "client/templates/layout/header/brand/brand.html",

    "client/templates/layout/footer/footer.html",

    "client/templates/layout/alerts/bootstrap-alerts.coffee",
    "client/templates/layout/alerts/alerts.html",
    "client/templates/layout/alerts/alerts.coffee",

    "client/templates/layout/loading/loading.html",
    "client/templates/layout/notFound/notFound.html",

    "client/templates/layout/notice/unauthorized.html",
    "client/templates/layout/notice/shopNotFound.html",

    "client/templates/accounts/accounts.html",
    "client/templates/accounts/accounts.coffee",

    "client/templates/accounts/inline/inline.html",
    "client/templates/accounts/inline/inline.coffee",

    "client/templates/accounts/dropdown/dropdown.html",
    "client/templates/accounts/dropdown/dropdown.coffee",

    "client/templates/cart/cartDrawer/cartDrawer.html",
    "client/templates/cart/cartDrawer/cartDrawer.coffee",

    "client/templates/cart/cartDrawer/cartItems/cartItems.html",
    "client/templates/cart/cartDrawer/cartItems/cartItems.coffee",

    "client/templates/cart/cartDrawer/cartSubTotals/cartSubTotals.html",
    "client/templates/cart/cartDrawer/cartSubTotals/cartSubTotals.coffee",

    "client/templates/cart/cartIcon/cartIcon.html",
    "client/templates/cart/cartIcon/cartIcon.coffee",

    "client/templates/cart/cartPanel/cartPanel.html",
    "client/templates/cart/cartPanel/cartPanel.coffee",

    "client/templates/cart/checkout/checkout.html",
    "client/templates/cart/checkout/checkout.js",

    "client/workflows/orders.coffee",

    "client/templates/cart/checkout/login/login.html",
    "client/templates/cart/checkout/login/login.js",

    "client/templates/cart/checkout/header/header.html",
    "client/templates/cart/checkout/header/header.coffee",

    "client/templates/cart/checkout/progressBar/progressBar.html",
    "client/templates/cart/checkout/progressBar/progressBar.coffee",

    "client/templates/cart/checkout/review/review.html",
    "client/templates/cart/checkout/review/review.js",

    "client/templates/cart/checkout/payment/payment.html",
    "client/templates/cart/checkout/payment/payment.coffee",

    "client/templates/cart/checkout/payment/methods/cards.html",
    "client/templates/cart/checkout/payment/methods/cards.coffee",

    "client/templates/cart/checkout/completed/completed.html",
    "client/templates/cart/checkout/completed/completed.coffee",

    "client/templates/cart/checkout/shipping/shipping.html",
    "client/templates/cart/checkout/shipping/shipping.js",

    "client/templates/cart/checkout/addressBook/addressBook.html",
    "client/templates/cart/checkout/addressBook/addressBook.js",

    "client/templates/dashboard/console/console.html",
    "client/templates/dashboard/console/console.coffee",

    "client/templates/dashboard/console/icon/icon.html",
    "client/templates/dashboard/console/icon/icon.coffee",

    "client/templates/dashboard/orders/orders.html",
    "client/templates/dashboard/orders/orders.coffee",

    "client/templates/dashboard/orders/orderPage/orderPage.html",
    "client/templates/dashboard/orders/orderPage/orderPage.coffee",

    "client/templates/dashboard/orders/orderPage/details/details.html",
    "client/templates/dashboard/orders/orderPage/details/details.coffee",

    "client/templates/dashboard/orders/list/ordersList.html",
    "client/templates/dashboard/orders/list/ordersList.coffee",

    "client/templates/dashboard/orders/list/items/items.html",
    "client/templates/dashboard/orders/list/items/items.coffee",

    "client/templates/dashboard/orders/list/summary/summary.html",
    "client/templates/dashboard/orders/list/summary/summary.coffee",

    "client/templates/dashboard/orders/list/pdf/pdf.html",
    "client/templates/dashboard/orders/list/pdf/pdf.coffee",

    "client/templates/dashboard/orders/widget/widget.html",
    "client/templates/dashboard/orders/widget/widget.coffee",

    "client/templates/dashboard/orders/details/detail.html",
    "client/templates/dashboard/orders/details/detail.coffee",

    "client/templates/dashboard/orders/social/orderSocial.html",
    "client/templates/dashboard/orders/social/orderSocial.coffee",

    "client/templates/dashboard/orders/stateHelpers/completed/completed.html",
    "client/templates/dashboard/orders/stateHelpers/completed/completed.coffee",

    "client/templates/dashboard/orders/stateHelpers/documents/documents.html",
    "client/templates/dashboard/orders/stateHelpers/documents/documents.coffee",

    "client/templates/dashboard/orders/stateHelpers/packing/packing.html",
    "client/templates/dashboard/orders/stateHelpers/packing/packing.coffee",

    "client/templates/dashboard/orders/stateHelpers/payment/payment.html",
    "client/templates/dashboard/orders/stateHelpers/payment/payment.coffee",

    "client/templates/dashboard/orders/stateHelpers/shipped/shipped.html",
    "client/templates/dashboard/orders/stateHelpers/shipped/shipped.coffee",

    "client/templates/dashboard/orders/stateHelpers/tracking/tracking.html",
    "client/templates/dashboard/orders/stateHelpers/tracking/tracking.coffee",

    "client/templates/dashboard/packages/packages.html",
    "client/templates/dashboard/packages/packages.coffee",

    "client/templates/dashboard/packages/grid/package/package.html",
    "client/templates/dashboard/packages/grid/package/package.coffee",

    "client/templates/dashboard/packages/grid/grid.html",
    "client/templates/dashboard/packages/grid/grid.coffee",

    "client/templates/dashboard/dashboard.html",
    "client/templates/dashboard/dashboard.coffee",

    "client/templates/dashboard/shop/settings/settings.html",
    "client/templates/dashboard/shop/settings/settings.coffee",

    "client/templates/dashboard/accounts/accounts.html",
    "client/templates/dashboard/accounts/accounts.coffee",

    "client/templates/dashboard/accounts/shopMember/shopMember.html",
    "client/templates/dashboard/accounts/shopMember/shopMember.coffee",

    "client/templates/dashboard/accounts/shopMember/memberForm/memberForm.html",
    "client/templates/dashboard/accounts/shopMember/memberForm/memberForm.coffee",

    "client/templates/products/products.html",
    "client/templates/products/products.coffee",

    "client/templates/products/productList/productList.html",
    "client/templates/products/productList/productList.coffee",

    "client/templates/products/productGrid/productGrid.html",
    "client/templates/products/productGrid/productGrid.coffee",

    "client/templates/products/productDetail/productDetail.html",
    "client/templates/products/productDetail/productDetail.coffee",

    "client/templates/products/productDetail/edit/edit.html",
    "client/templates/products/productDetail/edit/edit.coffee",

    "client/templates/products/productDetail/images/productImageGallery.html",
    "client/templates/products/productDetail/images/productImageGallery.coffee",

    "client/templates/products/productDetail/tags/tags.html",
    "client/templates/products/productDetail/tags/tags.coffee",

    "client/templates/products/productDetail/social/social.html",
    "client/templates/products/productDetail/social/social.coffee",

    "client/templates/products/productDetail/variants/variant.html",
    "client/templates/products/productDetail/variants/variant.coffee",

    "client/templates/products/productDetail/variants/variantList/variantList.html",
    "client/templates/products/productDetail/variants/variantList/variantList.coffee",

    "client/templates/products/productDetail/variants/variantForm/variantForm.html",
    "client/templates/products/productDetail/variants/variantForm/variantForm.coffee",

    "client/templates/products/productDetail/variants/variantForm/inventoryVariant/inventoryVariant.html",
    "client/templates/products/productDetail/variants/variantForm/inventoryVariant/inventoryVariant.coffee",

    "client/templates/products/productDetail/variants/variantForm/childVariant/childVariant.html",
    "client/templates/products/productDetail/variants/variantForm/childVariant/childVariant.coffee",

    "client/templates/products/productDetail/attributes/attributes.html",
    "client/templates/products/productDetail/attributes/attributes.coffee"
  ], ["client"]);

  // Email Templates
  api.addFiles('server/emailTemplates/welcomeNotification.html', 'server', {isAsset: true});
  api.addFiles('server/emailTemplates/shopMemberInvite.html', 'server', {isAsset: true});

  // Private fixture data
  api.addFiles('private/data/Products.json', 'server', {isAsset: true});
  api.addFiles('private/data/Shops.json', 'server', {isAsset: true});
  api.addFiles('private/data/Tags.json', 'server', {isAsset: true});
  api.addFiles('private/data/Orders.json', 'server', {isAsset: true});
  //i18n translations
  api.addFiles('private/data/i18n/ar.json', 'server', {isAsset: true});
  api.addFiles('private/data/i18n/cn.json', 'server', {isAsset: true});
  api.addFiles('private/data/i18n/cs.json', 'server', {isAsset: true});
  api.addFiles('private/data/i18n/de.json', 'server', {isAsset: true});
  api.addFiles('private/data/i18n/en.json', 'server', {isAsset: true});
  api.addFiles('private/data/i18n/el.json', 'server', {isAsset: true});
  api.addFiles('private/data/i18n/es.json', 'server', {isAsset: true});
  api.addFiles('private/data/i18n/fr.json', 'server', {isAsset: true});
  api.addFiles('private/data/i18n/he.json', 'server', {isAsset: true});
  api.addFiles('private/data/i18n/hr.json', 'server', {isAsset: true});
  api.addFiles('private/data/i18n/hu.json', 'server', {isAsset: true});
  api.addFiles('private/data/i18n/it.json', 'server', {isAsset: true});
  api.addFiles('private/data/i18n/my.json', 'server', {isAsset: true});
  api.addFiles('private/data/i18n/nl.json', 'server', {isAsset: true});
  api.addFiles('private/data/i18n/pl.json', 'server', {isAsset: true});
  api.addFiles('private/data/i18n/pt.json', 'server', {isAsset: true});
  api.addFiles('private/data/i18n/ru.json', 'server', {isAsset: true});
  api.addFiles('private/data/i18n/sl.json', 'server', {isAsset: true});
  api.addFiles('private/data/i18n/sv.json', 'server', {isAsset: true});
  api.addFiles('private/data/i18n/vi.json', 'server', {isAsset: true});

  // We are now grouping all exported app variables and methods under
  // "ReactionCore". The other exported variables should be moved to
  // somewhere within this scope.
  api.export("ReactionCore");
  api.export("ReactionRegistry","server");

  // legacy Exports (TODO: move to ReactionCore)
  api.export("Alerts", ["client"]);
  api.export("CartWorkflow", ["client"]);
  api.export("OrderWorkflow", ["client"]);
  api.export("OrderWorkflowEvents", ["client"]);

  api.export("currentProduct", ["client", "server"]);
});

Package.onTest(function(api) {
  api.use('coffeescript');
  api.use('underscore');
  api.use('sanjo:jasmine@0.17.0');
  api.use("anti:fake@0.4.1");
  api.use('velocity:html-reporter@0.8.2');
  api.use('velocity:console-reporter@0.1.3');

  api.use('reactioncommerce:core');
  api.use('reactioncommerce:bootstrap-theme');

  api.addFiles('tests/jasmine/server/integration/shops.coffee', 'server');
  api.addFiles('tests/jasmine/server/integration/accounts.coffee', 'server');
  api.addFiles('tests/jasmine/server/integration/methods.coffee', 'server');
  api.addFiles('tests/jasmine/server/integration/products.coffee', 'server');
  api.addFiles('tests/jasmine/server/integration/publicationSpec.js', 'server');
  api.addFiles('tests/jasmine/client/unit/shops.coffee', 'client');
  api.addFiles('tests/jasmine/client/integration/shops.coffee', 'client');
});
