// Give our package a description
Package.describe({
    summary: "Reaction Dashboard package - the main Reaction admin dashboard - Flaty Theme"
});

// Tell Meteor what to do with our package at bundle time
Package.on_use(function (api, where) {
    api.use(['standard-app-packages', 'underscore','iron-router','less']);

    var path = Npm.require('path');

    // This is the Reaction dashboard, all the other files are just the default template stuff, for docs and examples see those.
    api.add_files(path.join('client', 'subscribe.js'), 'client');
    api.add_files(path.join('model', 'model.js'), ['client','server']);

    api.add_files(path.join('client/templates', 'dashboardLayout.html'), 'client');

    api.add_files(path.join('client/templates/dashboardSidebar', 'dashboardSidebar.html'), 'client');
    api.add_files(path.join('client/templates/dashboardSidebar', 'dashboardSidebar.less'), 'client');
    api.add_files(path.join('client/templates/dashboardSidebar', 'dashboardSidebar.js'), 'client');

    api.add_files(path.join('client/templates/dashboard', 'dashboard.html'), 'client');
    api.add_files(path.join('client/templates/dashboard', 'dashboard.less'), 'client');
    api.add_files(path.join('client/templates/dashboard', 'dashboard.js'), 'client');

    api.add_files(path.join('client/templates/introduction', 'introduction.html'), 'client');
    api.add_files(path.join('client/templates/introduction', 'introduction.js'), 'client');

    api.add_files(path.join('client', 'router.js'), 'client');

    // *****************************************************
    // Selectively adding JS files (the order matters)
    // *****************************************************
    api.add_files(path.join('lib/packery', 'packery.pkgd.js'), 'client');
    // Small sparkline graphs
    // *****************************************************
    api.add_files(path.join('lib/sparkline', 'jquery.sparkline.min.js'), 'client');
    // *****************************************************
    // Gritter - growl like popup notifications
    // *****************************************************
    api.add_files(path.join('lib/gritter/css', 'jquery.gritter.css'), 'client');
    api.add_files(path.join('lib/gritter/css', 'path-override.css'), 'client');
    api.add_files(path.join('lib/gritter/images', 'gritter-light.png'), 'client');
    api.add_files(path.join('lib/gritter/images', 'gritter.png'), 'client');
    api.add_files(path.join('lib/gritter/js', 'jquery.gritter.js'), 'client');

    // *****************************************************
    // Register this package with Reaction
    // *****************************************************
      api.add_files([
        'client/templates/pkgManager/pkgManager.html',
        'client/templates/pkgManager/pkgManager.js',
        'client/templates/pkgManager/pkgManager.css'
        ],
        'client');

    api.add_files('server/register.js', 'server');
    api.add_files('server/publish.js', 'server');
    api.export('ReactionConfig',['client','server']);
    api.export('ReactionPackages',['client','server']);
    api.export('ReactionConfigHandle',['client','server']);
    api.export('UserConfig',['client']);
});
