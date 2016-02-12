ReactionCore.registerPackage({
  label: "i18n",
  name: "reaction-i18n",
  icon: "fa fa-language",
  autoEnable: true,
  settings: {
    name: "i18n"
  },
  registry: [{
    provides: "dashboard",
    template: "i18nDashboard",
    label: "i18n",
    description: "Internationalization utilities",
    icon: "fa fa-language",
    priority: 2
  }]
});
