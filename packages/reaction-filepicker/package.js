Package.describe({
  summary: "Reaction package of filepicker.io"
});

Package.on_use(function (api) {
  api.use([
    "coffeescript"
  ], ["client", "server"]);
  api.use([
    "templating",
    "jquery",
    "iron-router",
    "reaction-dashboard"
  ], ["client"]);
  
  api.add_files([
    "client/register.coffee",
    "client/routing.coffee",
    "client/loadpicker.coffee",
    "client/templates/filepicker-io/filepicker-io.html",
    "client/templates/filepicker-io/filepicker-io.coffee"
  ], ["client"]);

  api.export([
    "loadPicker"
  ], ["client"]);
});
