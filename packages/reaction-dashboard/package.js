Package.describe({
  summary: "Reaction Commerce dashboard templates",
  name: "reactioncommerce:reaction-dashboard",
  version: "1.0.0",
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

  // dashboard templates
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
});
