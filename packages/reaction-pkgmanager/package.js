Package.describe({
  summary: "Reaction Package Manager"
});

Package.on_use(function (api, where) {
  api.use('standard-app-packages');
  api.use(['underscore', 'deps', 'session', 'handlebars'], 'client');
  api.use(['templating', 'accounts-base', 'iron-router'], 'client');

  api.add_files('model/model.js');

  api.add_files([
    'router.js',
    'client/templates/pkgManager/pkgManager.html',
    'client/templates/pkgManager/pkgManager.js',
    'client/templates/pkgManager/pkgManager.css'
  ], 'client');

  api.add_files('server/register.js', 'server');
});
