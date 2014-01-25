// Give our package a description
Package.describe({
  summary: "Reaction Dashboard package - the main Reaction admin dashboard - Flaty Theme"
});

// Tell Meteor what to do with our package at bundle time
Package.on_use(function (api, where) {
  api.use([
    "standard-app-packages",
    "underscore",
    "iron-router",
    "simple-schema",
    "collection2",
    "less",
    "coffeescript",
  ], ["client", "server"]);

  api.add_files([
    "common/collections.coffee"
  ], ["client", "server"]);

  api.add_files([
    "lib/vendor/masonry/masonry.pkgd.js",
    "lib/vendor/sparkline/jquery.sparkline.js",

    "lib/app.coffee",
    "client/routing.coffee",
    "client/subscriptions.coffee",
    "client/register.coffee",

    "client/templates/dashboardSidebar/dashboardSidebar.html",
    "client/templates/dashboardSidebar/dashboardSidebar.less",
    "client/templates/dashboardSidebar/dashboardSidebar.coffee",

    "client/templates/dashboard/activePkgGrid/widget/widget.html",
    "client/templates/dashboard/activePkgGrid/widget/widget.less",
    "client/templates/dashboard/activePkgGrid/widget/widget.coffee",

    "client/templates/dashboard/activePkgGrid/activePkgGrid.html",
    "client/templates/dashboard/activePkgGrid/activePkgGrid.less",
    "client/templates/dashboard/activePkgGrid/activePkgGrid.coffee",

    "client/templates/dashboard/availablePkgGrid/pkg/pkg.html",
    "client/templates/dashboard/availablePkgGrid/pkg/pkg.less",
    "client/templates/dashboard/availablePkgGrid/pkg/pkg.coffee",

    "client/templates/dashboard/availablePkgGrid/availablePkgGrid.html",
    "client/templates/dashboard/availablePkgGrid/availablePkgGrid.less",
    "client/templates/dashboard/availablePkgGrid/availablePkgGrid.coffee",

    "client/templates/dashboard/dashboard.html",
    "client/templates/dashboard/dashboard.less",
    "client/templates/dashboard/dashboard.coffee",

    "client/templates/introduction/introduction.html",
    "client/templates/introduction/introduction.coffee"
    ], ["client"]);
    api.add_files([
      "server/publications.coffee"
    ], ["server"]);

  api.export([
    "Packages",
    "PackageConfigSchema"
  ], ["client", "server"]);
  api.export([
    "PackagesHandle"
  ], ["client"]);
});
