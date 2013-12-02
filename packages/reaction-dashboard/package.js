// Give our package a description
Package.describe({
    summary: "Reaction Dashboard package - the main Reaction admin dashboard - Flaty Theme"
});

// Tell Meteor what to do with our package at bundle time
Package.on_use(function (api, where) {
    api.use(['standard-app-packages', 'underscore','iron-router','less','coffeescript']);

    // api.use('reaction-shop');

    var path = Npm.require('path');

    // This is the Reaction dashboard, all the other files are just the default template stuff, for docs and examples see those.
    api.add_files(path.join('client', 'subscribe.js'), 'client');
    api.add_files(path.join('model', 'model.js'), ['client','server']);

    api.add_files(path.join('client/templates/dashboardSidebar', 'dashboardSidebar.html'), 'client');
    api.add_files(path.join('client/templates/dashboardSidebar', 'dashboardSidebar.less'), 'client');
    api.add_files(path.join('client/templates/dashboardSidebar', 'dashboardSidebar.js'), 'client');

    api.add_files(path.join('client/templates/dashboard', 'dashboard.html'), 'client');
    api.add_files(path.join('client/templates/dashboard', 'dashboard.less'), 'client');
    api.add_files(path.join('client/templates/dashboard', 'dashboard.js'), 'client');

    api.add_files(path.join('client/templates/introduction', 'introduction.html'), 'client');
    api.add_files(path.join('client/templates/introduction', 'introduction.js'), 'client');

    api.add_files(path.join('client', 'router.coffee'), 'client');

    // *****************************************************
    // Selectively adding JS files (the order matters)
    // *****************************************************
    api.add_files(path.join('lib/packery', 'packery.pkgd.js'), 'client');
    // Small sparkline graphs
    // *****************************************************
    api.add_files(path.join('lib/sparkline', 'jquery.sparkline.min.js'), 'client');

    api.add_files('server/register.js', 'server');
    api.add_files('server/publish.js', 'server');
    api.export('ReactionConfig',['client','server']);
    api.export('ReactionPackages',['client','server']);
    api.export('ReactionConfigHandle',['client','server']);
    api.export('UserConfig',['client']);
});
