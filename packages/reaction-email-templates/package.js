// Email Templates
Package.describe({
  summary: "Reaction Email Templates - set of basic email templates",
  name: "reactioncommerce:reaction-email-templates",
  documentation: "README.md",
  version: "0.1.1"
});

Package.onUse(function (api) {
  api.versionsFrom("METEOR@1.2");
  api.use("ecmascript");
  api.use("check");
  api.use("reactioncommerce:reaction-collections@1.0.3");
  api.use("meteorhacks:ssr@2.2.0");
  api.imply("meteorhacks:ssr");

  // define ReactionEmailTemplate
  api.addFiles("templates.js", "server");

  // Email Templates
  api.addAssets("templates/checkout/checkoutLogin.html", "server");
  api.addAssets("templates/coreDefault.html", "server");

  api.addAssets("templates/orders/new.html", "server");
  api.addAssets("templates/orders/coreOrderCompleted.html", "server");
  api.addAssets("templates/orders/coreOrderShippingInvoice.html", "server");
  api.addAssets("templates/orders/coreOrderShippingSummary.html", "server");
  api.addAssets("templates/orders/coreOrderShippingTracking.html", "server");

  // Accounts Email Templates
  api.addAssets("templates/accounts/sendWelcomeEmail.html", "server");
  api.addAssets("templates/accounts/inviteShopMember.html", "server");

  api.export("ReactionEmailTemplate");
});
