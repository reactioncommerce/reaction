Package.describe({
  summary: "Reaction package of filepicker.io"
});

Package.on_use(function (api) {
  api.imply('reaction-dashboard', ['client', 'server']);

  api.use('coffeescript');
  api.use(['templating', 'jquery', 'iron-router','reaction-dashboard'], 'client');
  // api.use(['reaction-dashboard','reaction-shop']);
  api.add_files([
    'client/router.coffee',
    'client/loadpicker.coffee',
    'client/templates/filepicker-io/filepicker-io.html',
    'client/templates/filepicker-io/filepicker-io.coffee'
  ], 'client');
  // register as reaction package
  api.add_files('client/register.coffee', 'client');
  // Export filePickerIO global
  api.export('loadPicker', 'client');
});
