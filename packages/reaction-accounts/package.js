Package.describe({
  summary: "Bootstrap 3 Less Accounts for Reaction"
});

Package.on_use(function (api) {
  api.use([
    "session",
    "handlebars",
    "accounts-password",
    "stylus",
    "less",
    "coffeescript",
    "accounts-base",
    "underscore",
    "templating",
    "reaction-commerce"
  ], ["client"]);

  api.add_files([
    "client/register.coffee",

    "client/templates/accounts_ui.coffee",

    "client/templates/loginButtons/login_buttons_images.css",
    "client/templates/loginButtons/login_buttons_dropdown.styl",

    "client/templates/loginButtons/login_buttons.html",
    "client/templates/loginButtons/login_buttons_single.html",
    "client/templates/loginButtons/login_buttons_dropdown.html",
    "client/templates/loginButtons/login_buttons_dialogs.html",

    "client/templates/loginButtons/login_buttons_session.coffee",

    "client/templates/loginButtons/login_buttons.coffee",
    "client/templates/loginButtons/login_buttons_single.coffee",
    "client/templates/loginButtons/login_buttons_dropdown.coffee",
    "client/templates/loginButtons/login_buttons_dialogs.coffee",

    "client/templates/loginInline/login_inline_images.css",

    "client/templates/loginInline/login_inline.html",
    "client/templates/loginInline/login_inline_single.html",
    "client/templates/loginInline/login_inline_form.html",
    "client/templates/loginInline/login_inline_dialogs.html",

    "client/templates/loginInline/login_inline_session.coffee",

    "client/templates/loginInline/login_inline.coffee",
    "client/templates/loginInline/login_inline_single.coffee",
    "client/templates/loginInline/login_inline_form.coffee",
    "client/templates/loginInline/login_inline_dialogs.coffee",

    "client/templates/accounts_ui.styl"
  ], ["client"]);
});
