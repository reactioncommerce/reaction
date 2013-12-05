// Give our package a description
Package.describe({
  summary: "Reaction Greetramp package - an email capture tool"
});

// Tell Meteor what to do with our package at bundle time
Package.on_use(function (api, where) {
  api.imply('reaction-dashboard', ['client', 'server']);
  // The api.use method allows us to depend on other
  // packages that ship with meteor or are in our project's
  // package directory
  api.use(['standard-app-packages', 'coffeescript']);
  api.use(['underscore', 'deps', 'session', 'handlebars', 'highcharts']);
  api.use(['templating', 'accounts-base', 'iron-router','reaction-shop','reaction-dashboard']);

  // we can add files to the client, server, or both
  // in this case load model.coffee on the client AND the server
  api.add_files('model/model.coffee');

  // Add templates.html and client.coffee files ONLY on
  // the client
  api.add_files([
    'client/templates/greetramp/greetramp.html',
    'client/templates/greetramp/greetramp.css',
    'client/templates/greetramp/graph/graph.html',
    'client/templates/greetramp/graph/graph.coffee',

    'client/templates/greetnav/greetnav.html',
    'client/templates/greetnav/greetnav.coffee',
    'client/templates/greetnav/addCampaign/addCampaign.html',
    'client/templates/greetnav/addCampaign/addCampaign.coffee',
    'client/templates/greetnav/campaignEdit/campaignEdit.html',
    'client/templates/greetnav/campaignEdit/campaignEdit.coffee',

    'client/templates/campaigns/campaigns.html',
    'client/templates/campaigns/campaigns.coffee',
    'client/templates/campaigns/broadcasts/broadcasts.html',
    'client/templates/campaigns/broadcasts/addBroadcast/addBroadcast.html',
    'client/templates/campaigns/broadcasts/addBroadcast/addBroadcast.coffee',
    'client/templates/campaigns/broadcasts/broadcastList/broadcastList.html',

    'client/handlebars.coffee',
    'client/subscribe.coffee',
    'client/router.coffee'
  ], 'client');

  // Add files *.coffee that server only
  api.add_files([
    'server/countstats.coffee',
    'server/fixtures.coffee',
    'server/publish.coffee',
  ], 'server');
  api.add_files('client/register.coffee', 'client');

  api.export(['CountStats', 'Captures', 'Counts', 'Campaigns']);
});
