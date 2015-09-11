Package.describe({
  summary: "Reaction Commerce Core",
  name: "reactioncommerce:core",
  version: "0.7.0",
  git: "https://github.com/reactioncommerce/reaction-core.git"
});

Npm.depends({
  'faker': "3.0.1",
  'node-geocoder': "3.0.0"
});

Package.onUse(function (api) {
  api.versionsFrom('METEOR@1.1.0.2');

  // core meteor packages
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

  // community packages
  api.use("mquandalle:bower@1.4.1_3");
  api.use("d3js:d3@3.5.5");
  api.use("underscorestring:underscore.string@3.2.0");
  api.use("aldeed:autoform@5.5.0");
  api.use("aldeed:collection2@2.5.0");
  api.use("aldeed:simple-schema@1.3.3");
  api.use("aldeed:template-extension@3.4.3", 'client');
  api.use("iron:router@1.0.9");
  api.use("ongoworks:speakingurl@5.0.1");
  api.use("ongoworks:bunyan-logger@2.5.0");
  api.use("ongoworks:security@1.2.0");

  api.use("dburles:factory@0.3.10");
  api.use("matb33:collection-hooks@0.7.14");
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
  api.use("aslagle:reactive-table@0.8.12");

  // imply exports package vars
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

  // reaction core dependencies
  api.addFiles("lib/bower.json","client");
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
  api.addFiles("lib/bower/jquery.tagsinput/dist/jquery.tagsinput.min.css", 'client', {isAsset: true});
  api.addFiles("lib/css/jquery-ui.css", 'client', {isAsset: true});
  api.addFiles("lib/bower/Faker/build/build/faker.js", ["client","server"]);
  api.addFiles("lib/faker.js", ["server"]);
  api.addFiles("lib/geocoder.js", ["server"]);

  // exports
  api.addFiles("common/globals.js");

  // init reaction core
  api.addFiles("client/main.js", "client");
  api.addFiles("server/main.js", "server");
  api.addFiles("server/register.js", "server");
  api.addFiles("common/common.js");

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

  // import fixture data
  api.addFiles("server/fixtures.js", "server");

  // schemas
  api.addFiles("common/schemas/packages.js");
  api.addFiles("common/schemas/accounts.js");
  api.addFiles("common/schemas/shops.js");
  api.addFiles("common/schemas/shipping.js");
  api.addFiles("common/schemas/products.js");
  api.addFiles("common/schemas/tags.js");
  api.addFiles("common/schemas/cart.js");
  api.addFiles("common/schemas/orders.js");
  api.addFiles("common/schemas/translations.js");
  api.addFiles("common/schemas/taxes.js");
  api.addFiles("common/schemas/discounts.js");

  // collections
  api.addFiles("common/collections/collections.js");
  api.addFiles("common/collections/collectionFS.js");

  // accounts
  api.addFiles("server/accounts.js", "server");

  // collection hooks
  api.addFiles("common/collections/hooks/hooks.js");

  // security
  api.addFiles("server/browserPolicy.js", "server");
  api.addFiles("server/security.js", "server");

  // common
  api.addFiles("common/routers.js");

  api.addFiles("common/methods/layout.js");
  api.addFiles("common/methods/cart.js", "client");

  api.addFiles("common/factories/faker.js");
  api.addFiles("common/factories/users.js");
  api.addFiles("common/factories/shops.js");
  api.addFiles("common/factories/accounts.js");
  api.addFiles("common/factories/products.js");
  api.addFiles("common/factories/cart.js");
  api.addFiles("common/factories/orders.js");

  // publications
  api.addFiles("server/publications/sessions.js", "server");
  api.addFiles("server/publications/shops.js", "server");
  api.addFiles("server/publications/accounts.js", "server");
  api.addFiles("server/publications/cart.js", "server");
  api.addFiles("server/publications/media.js", "server");
  api.addFiles("server/publications/orders.js", "server");
  api.addFiles("server/publications/packages.js", "server");
  api.addFiles("server/publications/products.js", "server");
  api.addFiles("server/publications/translations.js", "server");

  // methods
  api.addFiles("server/methods/accounts.js", "server");
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
  api.addFiles("client/helpers/packages.js", "client");
  api.addFiles("client/helpers/cart.js", "client");
  api.addFiles("client/helpers/globals.js", "client");
  api.addFiles("client/helpers/i18n.js", "client");
  api.addFiles("client/helpers/metadata.js", "client");
  api.addFiles("client/helpers/permissions.js", "client");
  api.addFiles("client/helpers/utilities.js", "client");

  api.addFiles("client/templates/layout/layout.html", "client");
  api.addFiles("client/templates/layout/layout.js", "client");

  api.addFiles("client/templates/layout/header/header.html", "client");
  api.addFiles("client/templates/layout/header/header.js", "client");

  api.addFiles("client/templates/layout/header/tags/tags.html", "client");
  api.addFiles("client/templates/layout/header/tags/tags.js", "client");

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

  api.addFiles("client/templates/accounts/accounts.html", "client");

  api.addFiles("client/templates/accounts/inline/inline.html", "client");
  api.addFiles("client/templates/accounts/inline/inline.js", "client");

  api.addFiles("client/templates/accounts/dropdown/dropdown.html", "client");
  api.addFiles("client/templates/accounts/dropdown/dropdown.js", "client");

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

  api.addFiles("client/templates/dashboard/orders/workflow/completed/completed.html", "client");

  api.addFiles("client/templates/dashboard/orders/workflow/documents/documents.html", "client");
  api.addFiles("client/templates/dashboard/orders/workflow/documents/documents.js", "client");

  api.addFiles("client/templates/dashboard/orders/workflow/packing/packing.html", "client");
  api.addFiles("client/templates/dashboard/orders/workflow/packing/packing.js", "client");

  api.addFiles("client/templates/dashboard/orders/workflow/payment/payment.html", "client");
  api.addFiles("client/templates/dashboard/orders/workflow/payment/payment.js", "client");

  api.addFiles("client/templates/dashboard/orders/workflow/shipped/shipped.html", "client");
  api.addFiles("client/templates/dashboard/orders/workflow/shipped/shipped.js", "client");

  api.addFiles("client/templates/dashboard/orders/workflow/tracking/tracking.html", "client");
  api.addFiles("client/templates/dashboard/orders/workflow/tracking/tracking.js", "client");

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

  api.addFiles("client/templates/products/productDetail/variants/variantForm/inventoryVariant/inventoryVariant.html", "client");
  api.addFiles("client/templates/products/productDetail/variants/variantForm/inventoryVariant/inventoryVariant.js", "client");

  api.addFiles("client/templates/products/productDetail/variants/variantForm/childVariant/childVariant.html", "client");
  api.addFiles("client/templates/products/productDetail/variants/variantForm/childVariant/childVariant.js", "client");

  api.addFiles("client/templates/products/productDetail/attributes/attributes.html", "client");
  api.addFiles("client/templates/products/productDetail/attributes/attributes.js", "client");

  api.addFiles("client/templates/products/productSettings/productSettings.html", "client");
  api.addFiles("client/templates/products/productSettings/productSettings.js", "client");

  // Email Templates
  api.addFiles('server/emailTemplates/welcomeNotification.html', 'server', {isAsset: true});
  api.addFiles('server/emailTemplates/shopMemberInvite.html', 'server', {isAsset: true});

  // Exports
  api.export("ReactionCore");
  api.export("ReactionRegistry","server");
  api.export("faker", ["server"]); //for testing only?

  // legacy Exports (TODO: move to ReactionCore)
  api.export("Alerts", ["client"]);
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
  api.addFiles('tests/jasmine/server/integration/publications.js', 'server');
});
