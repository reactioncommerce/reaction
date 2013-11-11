// Give our package a description
Package.describe({
    summary: "Reaction Dashboard package - the main Reaction admin dashboard - Flaty Theme"
});

// Tell Meteor what to do with our package at bundle time
Package.on_use(function (api, where) {
    api.use(['standard-app-packages', 'bootstrap-3', 'iron-router']);

    var path = Npm.require('path');

    // This is the Reaction dashboard, all the other files are just the default template stuff, for docs and examples see those.
    api.add_files(path.join('client', 'subscribe.js'), 'client');
    api.add_files(path.join('client/templates', 'dashboardLayout.html'), 'client');
    api.add_files(path.join('client/templates/dashboard', 'dashboard.html'), 'client');
    api.add_files(path.join('client/templates/dashboard', 'dashboard.js'), 'client');
    api.add_files(path.join('client/templates/dashboardHeader', 'dashboardHeader.html'), 'client');
    api.add_files(path.join('client/templates/dashboardHeader', 'dashboardHeader.js'), 'client');
    api.add_files(path.join('client/templates/dashboardSidebar', 'dashboardSidebar.html'), 'client');
    api.add_files(path.join('client/templates/dashboardSidebar', 'dashboardSidebar.js'), 'client');
    api.add_files(path.join('client', 'router.js'), 'client');

    // *****************************************************
    //  Selectively adding CSS assets, see assets.txt for full list
    //  The loading order does matter.
    // *****************************************************
    api.add_files(path.join('client/templates/dashboard/css', 'flaty-responsive.css'), 'client');
    api.add_files(path.join('client/templates/dashboard/css', 'flaty.css'), 'client');
    // *****************************************************
    // Add the font-awesome libary. You can use these in addition to bootstrap-3 glyphicons
    // http://fortawesome.github.io/Font-Awesome/
    // http://glyphicons.com/
    // *****************************************************
    api.add_files(path.join('lib/font-awesome/fonts', 'fontawesome-webfont.eot'), 'client');
    api.add_files(path.join('lib/font-awesome/fonts', 'fontawesome-webfont.svg'), 'client');
    api.add_files(path.join('lib/font-awesome/fonts', 'fontawesome-webfont.ttf'), 'client');
    api.add_files(path.join('lib/font-awesome/fonts', 'fontawesome-webfont.woff'), 'client');
    api.add_files(path.join('lib/font-awesome/fonts', 'FontAwesome.otf'), 'client');
    api.add_files(path.join('lib/font-awesome/css', 'font-awesome.css'), 'client');
    api.add_files(path.join('lib/font-awesome/css', 'path-override.css'), 'client'); // Ensure font-awesome is included on bundled deploys

    // *****************************************************
    // Selectively adding JS files (the order matters)
    // *****************************************************
    api.add_files(path.join('lib', 'nicescroll/jquery.nicescroll.min.js'), 'client');
    api.add_files(path.join('lib', 'jquery-cookie/jquery.cookie.js'), 'client');
    // *****************************************************
    // Bootstrap switch / toggle buttons
    // http://www.bootstrap-switch.org/
    // *****************************************************
    api.add_files(path.join('lib/bootstrap-switch/static/stylesheets', 'bootstrap-switch.css'), 'client');
    api.add_files(path.join('lib/bootstrap-switch/static/js', 'bootstrap-switch.js'), 'client');
    // *****************************************************
    // The Flot charting libary
    // *****************************************************
    api.add_files(path.join('lib/flot', 'jquery.flot.js'), 'client');
    api.add_files(path.join('lib/flot', 'jquery.flot.resize.js'), 'client');
    api.add_files(path.join('lib/flot', 'jquery.flot.pie.js'), 'client');
    api.add_files(path.join('lib/flot', 'jquery.flot.stack.js'), 'client');
    api.add_files(path.join('lib/flot', 'jquery.flot.crosshair.js'), 'client');
    api.add_files(path.join('lib/flot', 'jquery.flot.tooltip.min.js'), 'client');
    // *****************************************************
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
    // Dashboard Theme JS
    // *****************************************************
    api.add_files(path.join('client/templates/dashboard/js', 'gritter.js'), 'client');
    api.add_files(path.join('client/templates/dashboard/js', 'plot.js'), 'client');
    api.add_files(path.join('client/templates/dashboard/js', 'tiles.js'), 'client');
    api.add_files(path.join('client/templates/dashboard/js', 'gotop.js'), 'client');
    api.add_files(path.join('client/templates/dashboard/js', 'boxes.js'), 'client');
    api.add_files(path.join('client/templates/dashboard/js', 'sparkline.js'), 'client');
    api.add_files(path.join('client/templates/dashboard/js', 'theme.js'), 'client');

    // *****************************************************
    // Register this package with Reaction
    // *****************************************************
    api.add_files('server/register.js', 'server');
});
