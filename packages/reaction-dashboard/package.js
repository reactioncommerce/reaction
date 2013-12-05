// Give our package a description
Package.describe({
  summary: "Reaction Dashboard package - the main Reaction admin dashboard - Flaty Theme"
});

// Tell Meteor what to do with our package at bundle time
Package.on_use(function (api, where) {
  api.use(['standard-app-packages', 'underscore', 'iron-router', 'less', 'coffeescript']);

  api.add_files('lib/app.coffee', 'client');
  api.add_files('client/router.coffee', 'client');

  // This is the Reaction dashboard, all the other files are just the default template stuff, for docs and examples see those.
  api.add_files('client/subscribe.coffee', 'client');
  api.add_files('lib/collections.coffee', ['client', 'server']);

  api.add_files('client/templates/dashboardSidebar/dashboardSidebar.html', 'client');
  api.add_files('client/templates/dashboardSidebar/dashboardSidebar.less', 'client');
  api.add_files('client/templates/dashboardSidebar/dashboardSidebar.coffee', 'client');

  api.add_files('client/templates/dashboard/activePkgGrid/widget/widget.html', 'client');
  api.add_files('client/templates/dashboard/activePkgGrid/widget/widget.less', 'client');
  api.add_files('client/templates/dashboard/activePkgGrid/widget/widget.coffee', 'client');

  api.add_files('client/templates/dashboard/activePkgGrid/activePkgGrid.html', 'client');
  api.add_files('client/templates/dashboard/activePkgGrid/activePkgGrid.less', 'client');
  api.add_files('client/templates/dashboard/activePkgGrid/activePkgGrid.coffee', 'client');

  api.add_files('client/templates/dashboard/availablePkgGrid/pkg/pkg.html', 'client');
  api.add_files('client/templates/dashboard/availablePkgGrid/pkg/pkg.less', 'client');
  api.add_files('client/templates/dashboard/availablePkgGrid/pkg/pkg.coffee', 'client');

  api.add_files('client/templates/dashboard/availablePkgGrid/availablePkgGrid.html', 'client');
  api.add_files('client/templates/dashboard/availablePkgGrid/availablePkgGrid.less', 'client');
  api.add_files('client/templates/dashboard/availablePkgGrid/availablePkgGrid.coffee', 'client');

  api.add_files('client/templates/dashboard/dashboard.html', 'client');
  api.add_files('client/templates/dashboard/dashboard.less', 'client');
  api.add_files('client/templates/dashboard/dashboard.coffee', 'client');

  api.add_files('client/templates/introduction/introduction.html', 'client');
  api.add_files('client/templates/introduction/introduction.coffee', 'client');

  api.add_files('client/router.coffee', 'client');

  // *****************************************************
  // Selectively adding JS files (the order matters)
  // *****************************************************
  api.add_files('lib/packery/packery.pkgd.js', 'client');
  // Small sparkline graphs
  // *****************************************************
  api.add_files('lib/sparkline/jquery.sparkline.min.js', 'client');

  api.add_files('server/publish.coffee', 'server');
  api.export('PackageConfigs', ['client', 'server']);
  api.export('PackageConfigsHandle', ['client']);
});
