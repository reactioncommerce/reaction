Package.describe({
  summary: "Reaction HelloWorld - a Hello World package example"
});

Package.on_use(function (api, where) {
  api.use([
    "standard-app-packages",
    "coffeescript"
  ], ["client", "server"]);
  api.use([
    "iron-router",
    "less",
    "reaction-commerce"
  ], ["client"]);

  api.add_files([
    "client/register.coffee",
    "client/routing.coffee",

    "client/templates/helloworld/helloworld.html",
    "client/templates/helloworld/helloworld.coffee",
    "client/templates/helloworld/helloworld.less",

    "client/templates/dashboard/widget/widget.html",
    "client/templates/dashboard/widget/widget.coffee",
    "client/templates/dashboard/widget/widget.less"
  ], ["client"]);
});
