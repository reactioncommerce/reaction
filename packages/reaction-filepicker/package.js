Package.describe({
  summary: "Reaction package of filepicker.io"
});

Package.on_use(function (api) {
  api.use(['templating', 'jquery', 'iron-router'], 'client');
  api.use(['reaction-dashboard','reaction-shop']);
  api.add_files([
    //Router
    'client/router.js',
    //configuration files
    'client/loadpicker.js',
    'client/templates/filepicker-io/filepicker-io.html',
    'client/templates/filepicker-io/filepicker-io.js'
  ], 'client');
  // register as reaction package
  api.add_files('server/register.js', 'server');
  // Export filePickerIO global
  api.export('loadPicker', 'client');
});
