Package.describe({
  summary: "Reaction Mailgun - Mailgun Settings for Reaction Commerce"
});

Package.on_use(function (api, where) {
  api.use([
    "templating",
    "coffeescript",
    "iron-router",
    "simple-schema",
    "autoform",
    "underscore-string-latest",
  ], ["client", "server"]);

  api.use([
    "autoform",
    "less",
    "reaction-commerce"
  ], ["client"]);

  api.add_files("common/collections.coffee",["client","server"]);
  api.add_files([
    "client/register.coffee",
    "client/routing.coffee",
    "client/templates/mailgun.html",
    "client/templates/mailgun.less",
    "client/templates/mailgun.coffee",
  ],
  ["client"]);

  api.export([
    "MailgunSettingsSchema",
  ], ["client", "server"]);

});
