// Give our package a description
Package.describe({
    summary: "Reaction Greetramp package - an email capture tool"
});

// Tell Meteor what to do with our package at bundle time
Package.on_use(function (api, where) {

    // The api.use method allows us to depend on other
    // packages that ship with meteor or are in our project's
    // package directory
    api.use('standard-app-packages');
    api.use(['underscore', 'deps', 'session', 'handlebars', 'highcharts']);
    api.use(['templating', 'accounts-base', 'iron-router']);

    // we can add files to the client, server, or both
    // in this case load model.js on the client AND the server
    api.add_files('model/model.js');

    // Add templates.html and client.js files ONLY on
    // the client
    api.add_files([
        'client/templates/greetramp/greetramp.html',
        'client/templates/greetramp/greetramp.css',
        'client/templates/greetramp/graph/graph.html',
        'client/templates/greetramp/graph/graph.js',

        'client/templates/greetnav/greetnav.html',
        'client/templates/greetnav/greetnav.js',
        'client/templates/greetnav/addCampaign/addCampaign.html',
        'client/templates/greetnav/addCampaign/addCampaign.js',
        'client/templates/greetnav/campaignEdit/campaignEdit.html',
        'client/templates/greetnav/campaignEdit/campaignEdit.js',

        'client/templates/campaigns/campaigns.html',
        'client/templates/campaigns/campaigns.js',
        'client/templates/campaigns/broadcasts/broadcasts.html',
        'client/templates/campaigns/broadcasts/addBroadcast/addBroadcast.html',
        'client/templates/campaigns/broadcasts/addBroadcast/addBroadcast.js',
        'client/templates/campaigns/broadcasts/broadcastList/broadcastList.html',

        'client/handlebars.js',
        'client/subscribe.js',
        'client/router.js'
    ], 'client');

    // Add files *.js that server only
    api.add_files([
        'server/countstats.js',
        'server/fixtures.js',
        'server/publish.js',
        'server/register.js'
    ], 'server');

    api.export(['CountStats', 'Captures', 'Counts', 'Campaigns']);
});
