// Email Templates
Package.describe({
  summary: "Reaction Email Templates - set of basic email templates",
  name: "reactioncommerce:reaction-email-templates",
  documentation: "README.md",
  version: "0.1.0"
});

Package.onUse(function (api) {
  api.versionsFrom("METEOR@1.2");
  // Email Templates
  api.addFiles("templates.js", "server");
  api.addAssets("templates/accounts/welcomeNotification.html", "server");
  api.addAssets("templates/accounts/shopMemberInvite.html", "server");
  api.addAssets("templates/orders/itemsShipped.html", "server");

  api.export("ReactionEmailTemplate");
});
