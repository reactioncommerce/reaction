Package.describe({
  summary: "Reaction Accounts - Authentication UI for Reaction Commerce",
  name: "reactioncommerce:reaction-accounts",
  version: "1.0.1",
  git: "https://github.com/reactioncommerce/reaction-accounts"
});

Package.onUse(function (api, where) {
  api.versionsFrom('METEOR@1.1.0.3');

  // Core Meteor packages
  api.use("meteor-platform@1.2.2");
  api.use("email");
  api.use("random");
  api.use("reactive-var");
  api.use("reactive-dict");
  api.use("oauth-encryption");
  api.use("accounts-base");
  api.use("accounts-password");
  api.use("accounts-oauth");
  api.use("accounts-facebook");
  api.use("less");

  api.use("reactioncommerce:core@0.7.0");

  // Core Reaction packages

  // register as a reaction package
  api.addFiles("server/register.js", "server");

  api.addFiles("common/routing.js", ["client", "server"]);

  // Dashboard
  api.addFiles("client/templates/dashboard/accounts.html", "client");
  api.addFiles("client/templates/dashboard/accounts.js", "client");

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
  api.addFiles("client/templates/loginForm.js", "client");

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

  // basic styles
  api.addFiles("client/templates/loginForm.less", "client");



});


Package.onTest(function(api) {
  api.use('sanjo:jasmine@0.18.0');
  api.use('underscore');
  api.use("dburles:factory@0.3.10");
  api.use('velocity:html-reporter@0.8.2');
  api.use('velocity:console-reporter@0.1.3');

  api.use("reactioncommerce:reaction-accounts");

  api.addFiles('tests/jasmine/client/integration/login.js', 'client');

});
