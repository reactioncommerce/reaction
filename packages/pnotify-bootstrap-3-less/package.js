Package.describe({
    summary: "Pines notify packaged for meteor."
});

Package.on_use(function (api) {
    api.use('jquery', 'client');
    api.use('bootstrap3-less', 'client');
    api.add_files([
        'lib/js/jquery.pnotify.js',
        'lib/css/jquery.pnotify.default.css'
    ],'client');
});
