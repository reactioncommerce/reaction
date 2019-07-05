import Reaction from "/imports/plugins/core/core/server/Reaction";

Reaction.registerPackage({
  label: "Router",
  name: "reaction-router",
  icon: "fa fa-share-square-o",
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
