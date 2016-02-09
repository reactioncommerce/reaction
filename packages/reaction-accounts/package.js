Package.describe({
  summary: "Reaction Accounts - Authentication UI for Reaction Commerce",
  name: "reactioncommerce:reaction-accounts",
  version: "1.6.3",
  documentation: "README.md"
});

Package.onUse(function (api) {
  api.versionsFrom("METEOR@1.2");

  // meteor base packages
  api.use("meteor-base");
  api.use("mongo");
  api.use("blaze-html-templates");
  api.use("session");
  api.use("browser-policy");
  api.use("jquery");
  api.use("tracker");
  api.use("logging");
  api.use("reload");
  api.use("random");
  api.use("ejson");
  api.use("spacebars");
  api.use("check");
  api.use("ecmascript");

  // meteor add-on packages
  api.use("less");
  api.use("email");
  api.use("random");
  api.use("reactive-var");
  api.use("reactive-dict");
  api.use("oauth-encryption");
  api.use("accounts-base@1.2.2");
  api.use("accounts-password@1.1.4");
  api.use("jparker:gravatar@0.4.1");
  api.use("reactioncommerce:core@0.12.0");

  // accounts
  api.addFiles("server/register.js", "server");
  api.addFiles("server/accounts.js", "server");
  api.addFiles("server/policy.js", "server");
  api.addFiles("server/methods/serviceConfiguration.js", "server");


  // Core Reaction packages
  // register as a reaction package
  api.addFiles("server/methods/accounts.js", "server");
  api.addFiles("server/publications/serviceConfiguration.js", "server");

  // Helpers
  api.addFiles("client/helpers/util.js", ["client", "server"]);
  api.addFiles("client/helpers/validation.js", "client");
  api.addFiles("client/helpers/helpers.js", "client");
  api.addFiles("client/helpers/subscriptions.js", "client");

  // Dashboard
  api.addFiles("client/templates/dashboard/dashboard.html", "client");
  api.addFiles("client/templates/dashboard/dashboard.js", "client");

  api.addFiles("client/templates/members/member.html", "client");
  api.addFiles("client/templates/members/member.js", "client");
  api.addFiles("client/templates/members/memberForm.html", "client");
  api.addFiles("client/templates/members/memberForm.js", "client");

  // User profile
  api.addFiles("client/templates/profile/profile.html", "client");
  api.addFiles("client/templates/profile/profile.js", "client");

  // Address Book
  api.addFiles("client/templates/addressBook/addressBook.html", "client");
  api.addFiles("client/templates/addressBook/addressBook.js", "client");

  api.addFiles("client/templates/addressBook/add/add.html", "client");
  api.addFiles("client/templates/addressBook/add/add.js", "client");

  api.addFiles("client/templates/addressBook/edit/edit.html", "client");
  api.addFiles("client/templates/addressBook/edit/edit.js", "client");

  api.addFiles("client/templates/addressBook/form/form.html", "client");
  api.addFiles("client/templates/addressBook/form/form.js", "client");

  api.addFiles("client/templates/addressBook/grid/grid.html", "client");
  api.addFiles("client/templates/addressBook/grid/grid.js", "client");

  // core login form and generic templates
  api.addFiles("client/templates/login/loginForm.html", "client");
  api.addFiles("client/templates/login/loginButtons.html", "client");
  api.addFiles("client/templates/login/loginForm.less", "client");
  api.addFiles("client/templates/login/loginForm.js", "client");

  // sign in
  api.addFiles("client/templates/signIn/signIn.html", "client");
  api.addFiles("client/templates/signIn/signIn.js", "client");

  // sign in
  api.addFiles("client/templates/signUp/signUp.html", "client");
  api.addFiles("client/templates/signUp/signUp.js", "client");

  // reset password
  api.addFiles("client/templates/forgot/forgot.html", "client");
  api.addFiles("client/templates/forgot/forgot.js", "client");

  // Update password views
  api.addFiles("client/templates/updatePassword/updatePassword.html", "client");
  api.addFiles("client/templates/updatePassword/updatePassword.js", "client");

  api.addFiles("client/templates/accounts.html", "client");

  api.addFiles("client/templates/inline/inline.html", "client");
  api.addFiles("client/templates/inline/inline.js", "client");

  api.addFiles("client/templates/dropdown/dropdown.html", "client");
  api.addFiles("client/templates/dropdown/dropdown.js", "client");
  api.export("ReactionCore");
});

Package.onTest(function (api) {
  api.use("sanjo:jasmine@0.21.0");
  api.use("ecmascript");
  api.use("random");
  api.use("jquery");
  api.use("underscore");
  api.use("velocity:html-reporter@0.9.1");
  api.use("velocity:console-reporter@0.1.4");

  api.use("reactioncommerce:core");
  api.use("reactioncommerce:reaction-accounts");
  api.use("reactioncommerce:reaction-factories");

  api.addFiles("tests/jasmine/client/integration/login.js", "client");
  api.addFiles("tests/jasmine/server/integration/accounts.js", "server");
  api.addFiles("tests/jasmine/server/integration/publications.js", "server");
});
