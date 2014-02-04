Package.describe({
  summary: "Reaction Shop - commerce package for Reaction platform"
});

Npm.depends({
  "node-geocoder": "0.6.0"
});

Package.on_use(function (api, where) {
  api.use([
    "standard-app-packages",
    "coffeescript",
    "simple-schema",
    "collection-hooks",
    "collection2",
    "roles",
    "less",
    "underscore-string-latest",
    "handlebars-server"
  ], ["client", "server"]);
  api.use([
    "autoform",
    "bootstrap3-less",
    "accounts-base",
    "iron-router",
  ], ["client"]);
  api.use([
    "underscore"
  ], ["server"]);

  api.add_files([
    "lib/vendor/header_spy.coffee",
    "common/collections.coffee",
    "common/hooks.coffee",
  ], ["client", "server"]);


  api.add_files([

    "lib/vendor/masonry/masonry.pkgd.js",
    "lib/vendor/sparkline/jquery.sparkline.js",

    "lib/vendor/select2/select2.js",
    "lib/vendor/select2/select2.css",
    "lib/vendor/select2-bootstrap-css/select2-bootstrap.css",

    "lib/vendor/owl.carousel/owl-carousel/owl.carousel.css",
    "lib/vendor/owl.carousel/owl-carousel/owl.theme.css",
    "lib/vendor/owl.carousel/owl-carousel/owl.carousel.js",
    "lib/vendor/imagesLoaded/imagesloaded.pkgd.js",

    "client/app.coffee",
    "client/register.coffee",
    "client/helpers.coffee",
    "client/subscriptions.coffee",
    "client/routing.coffee",

    "client/templates/shopHeader/shopHeader.html",
    "client/templates/shopHeader/shopHeader.coffee",

    "client/templates/shopHeader/tags/tags.html",
    "client/templates/shopHeader/tags/tags.coffee",
    "client/templates/shopHeader/tags/tags.less",

    "client/templates/shopHeader/shopNavElements/shopNavElements.html",
    "client/templates/shopHeader/shopNavElements/shopNavElements.coffee",

    "client/templates/cart/cartDrawer/cartDrawer.html",
    "client/templates/cart/cartDrawer/cartDrawer.coffee",
    "client/templates/cart/cartDrawer/cartDrawer.less",

    "client/templates/cart/cartDrawer/cartItems/cartItems.html",
    "client/templates/cart/cartDrawer/cartItems/cartItems.coffee",
    "client/templates/cart/cartDrawer/cartItems/cartItems.less",

    "client/templates/cart/cartDrawer/cartSubTotals/cartSubTotals.html",
    "client/templates/cart/cartDrawer/cartSubTotals/cartSubTotals.coffee",
    "client/templates/cart/cartDrawer/cartSubTotals/cartSubTotals.less",

    "client/templates/cart/cartIcon/cartIcon.html",
    "client/templates/cart/cartIcon/cartIcon.coffee",
    "client/templates/cart/cartIcon/cartIcon.less",

    "client/templates/cart/checkout/checkout.html",
    "client/templates/cart/checkout/checkout.less",
    "client/templates/cart/checkout/checkout.coffee",

    "client/templates/cart/checkout/login/login.html",
    "client/templates/cart/checkout/login/login.less",
    "client/templates/cart/checkout/login/login.coffee",

    "client/templates/cart/checkout/header/header.html",
    "client/templates/cart/checkout/header/header.less",
    "client/templates/cart/checkout/header/header.coffee",

    "client/templates/cart/checkout/progressBar/progressBar.html",
    "client/templates/cart/checkout/progressBar/progressBar.less",
    "client/templates/cart/checkout/progressBar/progressBar.coffee",

    "client/templates/cart/checkout/addressBook/addressBook.html",
    "client/templates/cart/checkout/addressBook/addressBook.coffee",
    "client/templates/cart/checkout/addressBook/addressBook.less",

    "client/templates/cart/checkout/addressBook/addressForm/add.html",
    "client/templates/cart/checkout/addressBook/addressForm/add.coffee",
    "client/templates/cart/checkout/addressBook/addressForm/add.less",
    "client/templates/cart/checkout/addressBook/addressForm/edit.html",
    "client/templates/cart/checkout/addressBook/addressForm/edit.coffee",

    "client/templates/cart/checkout/review/review.html",
    "client/templates/cart/checkout/review/review.less",
    "client/templates/cart/checkout/review/review.coffee",

    "client/templates/cart/checkout/payment/payment.html",
    "client/templates/cart/checkout/payment/payment.less",
    "client/templates/cart/checkout/payment/payment.coffee",

    "client/templates/cart/checkout/payment/methods/cards.html",
    "client/templates/cart/checkout/payment/methods/cards.less",
    "client/templates/cart/checkout/payment/methods/cards.coffee",

    "client/templates/cart/checkout/completed/completed.html",
    "client/templates/cart/checkout/completed/completed.less",
    "client/templates/cart/checkout/completed/completed.coffee",

    "client/templates/cart/checkout/shipping/shipping.html",
    "client/templates/cart/checkout/shipping/shipping.less",
    "client/templates/cart/checkout/shipping/shipping.coffee",

    "client/templates/dashboard/widget/widget.html",
    "client/templates/dashboard/widget/widget.coffee",
    "client/templates/dashboard/widget/widget.less",

    "client/templates/dashboard/shopwelcome/shopwelcome.html",

    "client/templates/dashboard/customers/customers.html",
    "client/templates/dashboard/customers/customers.coffee",

    "client/templates/dashboard/orders/orders.html",
    "client/templates/dashboard/orders/orders.coffee",

    "client/templates/dashboard/navigation/dashboardSidebar.html",
    "client/templates/dashboard/navigation/dashboardSidebar.less",
    "client/templates/dashboard/navigation/dashboardSidebar.coffee",

    "client/templates/dashboard/packages/activePkgGrid/widget/widget.html",
    "client/templates/dashboard/packages/activePkgGrid/widget/widget.less",
    "client/templates/dashboard/packages/activePkgGrid/widget/widget.coffee",

    "client/templates/dashboard/packages/activePkgGrid/activePkgGrid.html",
    "client/templates/dashboard/packages/activePkgGrid/activePkgGrid.less",
    "client/templates/dashboard/packages/activePkgGrid/activePkgGrid.coffee",

    "client/templates/dashboard/packages/availablePkgGrid/pkg/pkg.html",
    "client/templates/dashboard/packages/availablePkgGrid/pkg/pkg.less",
    "client/templates/dashboard/packages/availablePkgGrid/pkg/pkg.coffee",

    "client/templates/dashboard/packages/availablePkgGrid/availablePkgGrid.html",
    "client/templates/dashboard/packages/availablePkgGrid/availablePkgGrid.less",
    "client/templates/dashboard/packages/availablePkgGrid/availablePkgGrid.coffee",

    "client/templates/dashboard/packages/dashboard.html",
    "client/templates/dashboard/packages/dashboard.less",
    "client/templates/dashboard/packages/dashboard.coffee",

    "client/templates/dashboard/introduction/introduction.html",
    "client/templates/dashboard/introduction/introduction.coffee",

    "client/templates/settings/settingsGeneral/settingsGeneral.html",
    "client/templates/settings/settingsGeneral/settingsGeneral.coffee",
    "client/templates/settings/settingsGeneral/settingsGeneral.less",

    "client/templates/settings/settingsAccount/settingsAccount.html",
    "client/templates/settings/settingsAccount/settingsAccount.coffee",

    "client/templates/settings/settingsAccount/shopMember/shopMember.html",
    "client/templates/settings/settingsAccount/shopMember/shopMember.coffee",
    "client/templates/settings/settingsAccount/shopMember/shopMember.less",

    "client/templates/settings/settingsAccount/shopMember/memberForm/memberForm.html",
    "client/templates/settings/settingsAccount/shopMember/memberForm/memberForm.coffee",

    "client/templates/products/products.html",
    "client/templates/products/products.less",

    "client/templates/products/productList/productList.html",
    "client/templates/products/productList/productList.coffee",
    "client/templates/products/productList/productList.less",

    "client/templates/products/productGrid/productGrid.html",
    "client/templates/products/productGrid/productGrid.coffee",
    "client/templates/products/productGrid/productGrid.less",

    "client/templates/products/productDetail/productDetail.html",
    "client/templates/products/productDetail/productDetail.coffee",
    "client/templates/products/productDetail/productDetail.less",

    "client/templates/products/productDetail/images/productImageGallery.html",
    "client/templates/products/productDetail/images/productImageGallery.coffee",
    "client/templates/products/productDetail/images/productImageGallery.less",

    "client/templates/products/productDetail/social/social.html",
    "client/templates/products/productDetail/social/social.coffee",
    "client/templates/products/productDetail/social/social.less",

    "client/templates/products/productDetail/variants/variant.html",
    "client/templates/products/productDetail/variants/variant.coffee",
    "client/templates/products/productDetail/variants/variant.less",

    "client/templates/products/productDetail/variants/variantForm/variantForm.html",
    "client/templates/products/productDetail/variants/variantForm/variantForm.coffee",
    "client/templates/products/productDetail/variants/variantForm/variantForm.less",

    "client/templates/products/productDetail/attributes/attributes.html",
    "client/templates/products/productDetail/attributes/attributes.less",
    "client/templates/products/productDetail/attributes/attributes.coffee",

    "client/templates/notice/unauthorized.html",

    "client/templates/notice/shopNotFound.html"
  ], ["client"]);
  api.add_files([
    "server/app.coffee",
    "server/methods.coffee",
    "server/publications.coffee",
    "server/emailTemplates/shopMemberInvite.handlebars",
    "server/emailTemplates/shopMemberNotification.handlebars"
  ], ["server"]);

  api.export([
    "PackagesHandle"
  ], ["client"]);

  api.export([
    "Packages",
    "PackageConfigSchema",
    "currentProduct",
    "install_spy",
    "ShopController",
    "Products",
    "Orders",
    "Customers",
    "ShopMemberSchema",
    "ProductVariantSchema",
    "AddressSchema",
    "VariantMediaSchema",
    "MetafieldSchema",
    "CartItemSchema",
    "variant",
    "Shop",
    "Cart",
    "Tags"
  ], ["client", "server"]);
});
