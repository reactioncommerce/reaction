import { Reaction } from "/server/api";

export default function () {
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
        priority: 2,
        container: "core"
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
}
