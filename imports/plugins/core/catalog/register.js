import { Reaction } from "/server/api";

Reaction.registerPackage({
  label: "Catalog",
  name: "reaction-catalog",
  icon: "fa fa-book",
  autoEnable: true,
  settings: {
    name: "Catalog"
  },
  registry: [
    {
      provides: ["dashboard"],
      label: "Catalog",
      description: "Product catalog",
      icon: "fa fa-book",
      container: "core"
    },
    {
      label: "Catalog Settings",
      icon: "fa fa-book",
      name: "catalog/settings",
      provides: ["settings"],
      template: "catalogSettings"
    }
  ]
});
