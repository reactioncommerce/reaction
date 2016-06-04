// Email Templates
Package.describe({
  summary: "Reaction Email Notifications - Send email notifications",
  name: "reactioncommerce:reaction-email-templates",
  documentation: "README.md",
  version: "0.2.1"
});

Package.onUse(function (api) {
  api.versionsFrom("METEOR@1.3");
  api.use("ecmascript");
  api.use("email");
  api.use("check");
  api.use("random");
  api.use("reactioncommerce:reaction-collections@2.2.1");
  api.use("reactioncommerce:core@0.13.0");
  api.use("meteorhacks:ssr@2.2.0");
  api.imply("meteorhacks:ssr");

  // register reaction package
  api.addFiles("server/register.js", "server");
  api.addFiles("server/compileTemplates.js", "server");

  api.addFiles("server/hooks.js", "server");

  // Email Templates
  api.addAssets("templates/checkout/checkoutLogin.html", "server");

  api.addAssets("templates/orders/new.html", "server");
  api.addAssets("templates/orders/coreOrderCreated.html", "server");
  api.addAssets("templates/orders/coreOrderCompleted.html", "server");
  api.addAssets("templates/orders/coreOrderShippingInvoice.html", "server");
  api.addAssets("templates/orders/coreOrderShippingSummary.html", "server");
  api.addAssets("templates/orders/coreOrderShippingTracking.html", "server");

  // Accounts Email Templates
  api.addAssets("templates/accounts/sendWelcomeEmail.html", "server");
  api.addAssets("templates/accounts/inviteShopMember.html", "server");

});
