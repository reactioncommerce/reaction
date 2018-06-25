import Reaction from "/imports/plugins/core/core/server/Reaction";

export default function () {
  Reaction.registerPackage({
    label: "Router",
    name: "reaction-router",
    icon: "fa fa-share-square-o",
    autoEnable: true,
    settings: {
      name: "Layout"
    },
    registry: [{
      provides: ["dashboard"],
      label: "Routing",
      description: "Routing utilities",
      icon: "fa fa-share-square-o",
      priority: 1,
      container: "utilities"
    }]
  });
}
