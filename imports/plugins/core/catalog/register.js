import { Reaction } from "/server/api";

Reaction.registerPackage({
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
      label: "Catalog",
      description: "Product catalog",
      icon: "fa fa-archive",
      container: "core"
    },
    {
      label: "Catalog Settings",
      icon: "fa fa-archive",
      name: "catalog/settings",
      provides: "settings",
      template: "catalogSettings"
    }
  ]
});
