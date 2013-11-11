// Give our package a description
Package.describe({
  summary: "Reaction HelloWorld - a Hello World package example"
});

// Tell Meteor what to do with our package at bundle time
Package.on_use(function (api,where) {

  // The api.use method allows us to depend on other
  // packages that ship with meteor or are in our project's package directory
  api.use('standard-app-packages');
  api.use(['iron-router', 'less'], 'client');

  // we can add files to the client, server, or both
  // in this case load both.js on the client AND the server
  api.add_files([
    'client/router.js',
    'client/templates/helloworld/helloworld.html',
    'client/templates/helloworld/helloworld.js',
    'client/templates/helloworld/helloworld.less'
  ], 'client');

  api.add_files([
    'server/register.js'
  ], 'server');
});
