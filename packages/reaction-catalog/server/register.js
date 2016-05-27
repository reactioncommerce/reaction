ReactionCore.registerPackage({
  label: "Catalog",
  name: "reaction-catalog",
  icon: "fa fa-archive",
  autoEnable: true,
  registry: [
    {
      provides: "dashboard",
      label: "Catalog",
      description: "Product catalog",
      icon: "fa fa-archive",
      priority: 1,
      container: "utilities"
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
