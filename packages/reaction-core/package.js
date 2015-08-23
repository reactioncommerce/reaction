Package.describe({
  summary: "Core - Reaction Commerce ecommerce Meteor package",
  name: "reactioncommerce:core",
  version: "0.7.0",
  git: "https://github.com/reactioncommerce/reaction-core.git"
});

Npm.depends({
  faker: '3.0.1'
});

Package.onUse(function (api) {
  api.versionsFrom('METEOR@1.1.0.2');

  //core meteor packages
  api.use("meteor-platform");
  api.use("oauth-encryption");
  api.use("accounts-base");
  api.use("accounts-password");
  api.use("less");
  api.use("http");
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
  api.use("matb33:collection-hooks@0.7.13");
  api.use("alanning:roles@1.2.13");
  api.use("momentjs:moment@2.10.6");
  api.use("risul:moment-timezone@0.4.0");
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
  api.imply("ongoworks:speakingurl");
  api.imply("ongoworks:security");
  api.imply("dburles:factory");
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
  api.imply("momentjs:moment");
  api.imply("utilities:spin", ["client"]);
  api.imply("utilities:avatar");

  // Core Reaction files
  api.addFiles("lib/bower.json","client");
  api.addFiles("lib/bower/Faker/build/build/faker.js", ["client","server"]);
  api.addFiles("lib/faker.js", ["server"]);

  api.addFiles([
    "common/globals.js",
    "common/helpers.js",
    "common/routers.js",

    "common/schemas/packages.js",
    "common/schemas/accounts.js",
    "common/schemas/shops.js",
    "common/schemas/shipping.js",
    "common/schemas/products.js",
    "common/schemas/tags.js",
    "common/schemas/cart.js",
    "common/schemas/orders.js",
    "common/schemas/translations.js",
    "common/schemas/taxes.js",
    "common/schemas/discounts.js",

    "common/collections/collections.js",
    "common/collections/collectionFS.js",

    "common/hooks/hooks.js",
    "common/methods/cart.js",
    "common/factories/faker.js",
    "common/factories/users.js",
    "common/factories/shops.js",
    "common/factories/accounts.js",
    "common/factories/products.js",
    "common/factories/cart.js",
    "common/factories/orders.js"
  ], ["client", "server"]);

  api.addFiles([
    "server/app.js",
    "server/fixtures.js",
    "server/browserPolicy.js",
    "server/register.js",
    "server/security.js",

    "server/publications/accounts.js",
    "server/publications/cart.js",
    "server/publications/media.js",
    "server/publications/orders.js",
    "server/publications/products.js",
    "server/publications/sessions.js",
    "server/publications/shops.js",
    "server/publications/translations.js",

    "server/methods/accounts.js",
    "server/methods/cart.js",
    "server/methods/hooks.js",
    "server/methods/orders.js",
    "server/methods/products.js",
    "server/methods/shop.js",
    "server/methods/shipping.js"
  ], ["server"]);

  api.addFiles([
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

    "client/subscriptions.js",
    "client/app.js",

    "client/helpers/apps.js",
    "client/helpers/cart.js",
    "client/helpers/globals.js",
    "client/helpers/i18n.js",
    "client/helpers/metadata.js",
    "client/helpers/permissions.js",
    "client/helpers/utilities.js",

    "client/templates/layout/layout.html",
    "client/templates/layout/layout.js",

    "client/templates/layout/header/header.html",
    "client/templates/layout/header/header.js",

    "client/templates/layout/header/tags/tags.html",
    "client/templates/layout/header/tags/tags.js",

    "client/templates/layout/header/i18n/i18n.html",
    "client/templates/layout/header/i18n/i18n.js",

    "client/templates/layout/header/brand/brand.html",

    "client/templates/layout/footer/footer.html",

    "client/templates/layout/alerts/bootstrapAlerts.js",
    "client/templates/layout/alerts/alerts.html",
    "client/templates/layout/alerts/alerts.js",

    "client/templates/layout/loading/loading.html",
    "client/templates/layout/notFound/notFound.html",

    "client/templates/layout/notice/unauthorized.html",
    "client/templates/layout/notice/shopNotFound.html",

    "client/templates/accounts/accounts.html",
    "client/templates/accounts/accounts.js",

    "client/templates/accounts/inline/inline.html",
    "client/templates/accounts/inline/inline.js",

    "client/templates/accounts/dropdown/dropdown.html",
    "client/templates/accounts/dropdown/dropdown.js",

    "client/templates/cart/cartDrawer/cartDrawer.html",
    "client/templates/cart/cartDrawer/cartDrawer.js",

    "client/templates/cart/cartDrawer/cartItems/cartItems.html",
    "client/templates/cart/cartDrawer/cartItems/cartItems.js",

    "client/templates/cart/cartDrawer/cartSubTotals/cartSubTotals.html",
    "client/templates/cart/cartDrawer/cartSubTotals/cartSubTotals.js",

    "client/templates/cart/cartIcon/cartIcon.html",
    "client/templates/cart/cartIcon/cartIcon.js",

    "client/templates/cart/cartPanel/cartPanel.html",
    "client/templates/cart/cartPanel/cartPanel.js",

    "client/templates/cart/checkout/checkout.html",
    "client/templates/cart/checkout/checkout.js",

    "client/workflows/orders.js",

    "client/templates/cart/checkout/header/header.html",

    "client/templates/cart/checkout/login/login.html",
    "client/templates/cart/checkout/login/login.js",

    "client/templates/cart/checkout/progressBar/progressBar.html",
    "client/templates/cart/checkout/progressBar/progressBar.js",

    "client/templates/cart/checkout/review/review.html",
    "client/templates/cart/checkout/review/review.js",

    "client/templates/cart/checkout/payment/payment.html",
    "client/templates/cart/checkout/payment/methods/cards.html",
    "client/templates/cart/checkout/payment/methods/cards.js",

    "client/templates/cart/checkout/completed/completed.html",
    "client/templates/cart/checkout/completed/completed.js",

    "client/templates/cart/checkout/shipping/shipping.html",
    "client/templates/cart/checkout/shipping/shipping.js",

    "client/templates/cart/checkout/addressBook/addressBook.html",
    "client/templates/cart/checkout/addressBook/addressBook.js",

    "client/templates/dashboard/console/console.html",
    "client/templates/dashboard/console/console.js",

    "client/templates/dashboard/console/icon/icon.html",
    "client/templates/dashboard/console/icon/icon.js",

    "client/templates/dashboard/orders/orders.html",
    "client/templates/dashboard/orders/orders.js",

    "client/templates/dashboard/orders/orderPage/orderPage.html",
    "client/templates/dashboard/orders/orderPage/orderPage.js",

    "client/templates/dashboard/orders/orderPage/details/details.html",
    "client/templates/dashboard/orders/orderPage/details/details.js",

    "client/templates/dashboard/orders/list/ordersList.html",
    "client/templates/dashboard/orders/list/ordersList.js",

    "client/templates/dashboard/orders/list/items/items.html",
    "client/templates/dashboard/orders/list/items/items.js",

    "client/templates/dashboard/orders/list/summary/summary.html",
    "client/templates/dashboard/orders/list/summary/summary.js",

    "client/templates/dashboard/orders/list/pdf/pdf.html",
    "client/templates/dashboard/orders/list/pdf/pdf.js",

    "client/templates/dashboard/orders/widget/widget.html",
    "client/templates/dashboard/orders/widget/widget.js",

    "client/templates/dashboard/orders/details/detail.html",
    "client/templates/dashboard/orders/details/detail.js",

    "client/templates/dashboard/orders/social/orderSocial.html",

    "client/templates/dashboard/orders/stateHelpers/completed/completed.html",

    "client/templates/dashboard/orders/stateHelpers/documents/documents.html",
    "client/templates/dashboard/orders/stateHelpers/documents/documents.js",

    "client/templates/dashboard/orders/stateHelpers/packing/packing.html",
    "client/templates/dashboard/orders/stateHelpers/packing/packing.js",

    "client/templates/dashboard/orders/stateHelpers/payment/payment.html",
    "client/templates/dashboard/orders/stateHelpers/payment/payment.js",

    "client/templates/dashboard/orders/stateHelpers/shipped/shipped.html",
    "client/templates/dashboard/orders/stateHelpers/shipped/shipped.js",

    "client/templates/dashboard/orders/stateHelpers/tracking/tracking.html",
    "client/templates/dashboard/orders/stateHelpers/tracking/tracking.js",

    "client/templates/dashboard/packages/packages.html",

    "client/templates/dashboard/packages/grid/package/package.html",
    "client/templates/dashboard/packages/grid/package/package.js",

    "client/templates/dashboard/packages/grid/grid.html",
    "client/templates/dashboard/packages/grid/grid.js",

    "client/templates/dashboard/dashboard.html",
    "client/templates/dashboard/dashboard.js",

    "client/templates/dashboard/shop/settings/settings.html",
    "client/templates/dashboard/shop/settings/settings.js",

    "client/templates/dashboard/accounts/accounts.html",
    "client/templates/dashboard/accounts/accounts.js",

    "client/templates/dashboard/accounts/shopMember/shopMember.html",
    "client/templates/dashboard/accounts/shopMember/shopMember.js",

    "client/templates/dashboard/accounts/shopMember/memberForm/memberForm.html",
    "client/templates/dashboard/accounts/shopMember/memberForm/memberForm.js",

    "client/templates/products/products.html",
    "client/templates/products/products.js",

    "client/templates/products/productList/productList.html",
    "client/templates/products/productList/productList.js",

    "client/templates/products/productGrid/productGrid.html",
    "client/templates/products/productGrid/productGrid.js",

    "client/templates/products/productDetail/productDetail.html",
    "client/templates/products/productDetail/productDetail.js",

    "client/templates/products/productDetail/edit/edit.html",
    "client/templates/products/productDetail/edit/edit.js",

    "client/templates/products/productDetail/images/productImageGallery.html",
    "client/templates/products/productDetail/images/productImageGallery.js",

    "client/templates/products/productDetail/tags/tags.html",
    "client/templates/products/productDetail/tags/tags.js",

    "client/templates/products/productDetail/social/social.html",
    "client/templates/products/productDetail/social/social.js",

    "client/templates/products/productDetail/variants/variant.html",
    "client/templates/products/productDetail/variants/variant.js",

    "client/templates/products/productDetail/variants/variantList/variantList.html",
    "client/templates/products/productDetail/variants/variantList/variantList.js",

    "client/templates/products/productDetail/variants/variantForm/variantForm.html",
    "client/templates/products/productDetail/variants/variantForm/variantForm.js",

    "client/templates/products/productDetail/variants/variantForm/inventoryVariant/inventoryVariant.html",
    "client/templates/products/productDetail/variants/variantForm/inventoryVariant/inventoryVariant.js",

    "client/templates/products/productDetail/variants/variantForm/childVariant/childVariant.html",
    "client/templates/products/productDetail/variants/variantForm/childVariant/childVariant.js",

    "client/templates/products/productDetail/attributes/attributes.html",
    "client/templates/products/productDetail/attributes/attributes.js"
  ], ["client"]);

  // Email Templates
  api.addFiles('server/templates/welcomeNotification.html', 'server', {isAsset: true});
  api.addFiles('server/templates/shopMemberInvite.html', 'server', {isAsset: true});


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
  api.export("faker", ["server"]); //for testing only?

  // legacy Exports (TODO: move to ReactionCore)
  api.export("Alerts", ["client"]);
  api.export("OrderWorkflow", ["client"]);
  api.export("OrderWorkflowEvents", ["client"]);
  api.export("currentProduct", ["client", "server"]);
});


Package.onTest(function(api) {
  api.use('sanjo:jasmine@0.18.0');
  api.use('underscore');
  api.use("dburles:factory@0.3.10");
  api.use('velocity:html-reporter@0.8.2');
  api.use('velocity:console-reporter@0.1.3');

  api.use('reactioncommerce:core');
  api.use('reactioncommerce:bootstrap-theme');

  api.addFiles('tests/jasmine/server/integration/shops.js', 'server');
  api.addFiles('tests/jasmine/server/integration/accounts.js', 'server');
  api.addFiles('tests/jasmine/server/integration/methods.js', 'server');
  api.addFiles('tests/jasmine/server/integration/products.js', 'server');
  api.addFiles('tests/jasmine/server/integration/publicationSpec.js', 'server');
  api.addFiles('tests/jasmine/client/unit/shops.js', 'client');
  api.addFiles('tests/jasmine/client/integration/shops.js', 'client');
});
