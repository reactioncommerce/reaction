Package.describe({
  summary: "Reaction package of Ink Filepicker"
});

Package.on_use(function (api) {
  api.use([
    "coffeescript",
    "iron-router",
  ], ["client", "server"]);
  api.use([
    "templating",
    "jquery",
    "reaction-commerce",
  ], ["client"]);

  api.add_files([
    "client/routing.coffee",
    "client/register.coffee",
    "client/loadpicker.coffee",
    "client/templates/filepicker/filepicker.html",
    "client/templates/filepicker/filepicker.coffee"
  ], ["client"]);

  api.export([
    "loadPicker"
  ], ["client"]);
});
