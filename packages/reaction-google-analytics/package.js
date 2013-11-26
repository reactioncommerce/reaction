// Give our package a description
Package.describe({
  summary: "Reaction Google Analytics"
});

// Tell Meteor what to do with our package at bundle time
Package.on_use(function (api, where) {

  // The api.use method allows us to depend on other
  // packages that ship with meteor or are in our project's package directory
  api.use(['standard-app-packages', 'coffeescript']);
  api.use([
    'less',
    'simple-schema',
    'collection2',
    'iron-router'
  ], 'client');

  // we can add files to the client, server, or both
  // in this case load both.js on the client AND the server
  api.add_files([
    'client/compatibility/google-analytics-bootstrap.js',
    'client/routing.coffee',
    'client/startup.coffee',
    'client/templates/googleAnalytics/googleAnalytics.html'
  ], 'client');

  api.add_files([
    'server/register.coffee'
  ], 'server');
});
