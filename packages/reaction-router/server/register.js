ReactionCore.registerPackage({
  label: "Router",
  name: "reaction-router",
  icon: "fa fa-share-square-o",
  autoEnable: true,
  settings: {
    name: "Layout"
  },
  registry: [{
    provides: "dashboard",
    template: "routerDashboard",
    label: "Routing",
    description: "Routing utilities",
    icon: "fa fa-share-square-o",
    priority: 4
  }]
});
