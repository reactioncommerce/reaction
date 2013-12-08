Package.describe({
  summary: "Bootstrap 3 Less Accounts for Reaction"
});

Package.on_use(function (api) {
  api.use(['session', 'handlebars', 'accounts-password','stylus','less', 'coffeescript', 'accounts-base', 'underscore', 'templating'], 'client');

  api.add_files([
    'client/register.coffee',
    'client/templates/accounts_ui.coffee',

    'client/templates/login_buttons_images.css',
    'client/templates/login_buttons_dropdown.styl',

    'client/templates/login_buttons.html',
    'client/templates/login_buttons_single.html',
    'client/templates/login_buttons_dropdown.html',
    'client/templates/login_buttons_dialogs.html',

    'client/templates/login_buttons_session.coffee',

    'client/templates/login_buttons.coffee',
    'client/templates/login_buttons_single.coffee',
    'client/templates/login_buttons_dropdown.coffee',
    'client/templates/login_buttons_dialogs.coffee',
    'client/templates/accounts_ui.styl'], 'client');
});

Package.on_test(function (api) {
  //api.use('meteor-accounts-ui-bootstrap');
  //api.use('tinytest');
  //api.add_files('accounts_ui_tests.coffee', 'client');
});
