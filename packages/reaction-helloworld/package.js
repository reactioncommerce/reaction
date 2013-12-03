// Give our package a description
Package.describe({
  summary: "Reaction HelloWorld - a Hello World package example"
});

// Tell Meteor what to do with our package at bundle time
Package.on_use(function (api, where) {
  // Make sure reaction-dashboard is present and is included before this package
  api.imply('reaction-dashboard', ['client', 'server']);

  // The api.use method allows us to depend on other
  // packages that ship with meteor or are in our project's package directory
  api.use([
    'standard-app-packages',
    'coffeescript'
  ]);
  api.use([
    'iron-router',
    'less'
  ], 'client');

  // we can add files to the client, server, or both
  api.add_files([
    'client/register.coffee',
    'client/router.coffee',
    //package views
    'client/templates/helloworld/helloworld.html',
    'client/templates/helloworld/helloworld.coffee',
    'client/templates/helloworld/helloworld.less',
    //dashboard widget
    'client/templates/dashboard/widget/widget.html',
    'client/templates/dashboard/widget/widget.coffee',
    'client/templates/dashboard/widget/widget.less'
  ], 'client');
});
