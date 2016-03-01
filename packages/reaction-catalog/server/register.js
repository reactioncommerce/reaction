// FIXME: Please fix me a good man
ReactionCore.registerPackage({
  label: "Catalog",
  name: "reaction-catalog",
  icon: "fa fa-archive",
  autoEnable: true,
  settings: {
    name: "Catalog"
  },
  registry: [
    {
      provides: "dashboard",
      // route: "dashboard/catalog",
      label: "Catalog",
      description: "Allows to create simple product",
      icon: "fa fa-archive",
      cycle: 1,
      group: "reaction-catalog"
    }/* ,
    {
      label: "Catalog Settings",
      // route: "dashboard/catalog",
      provides: "settings"
      // group: "reaction-catalog",
      // template: "catalogSettings"
    } */
  ]
});
