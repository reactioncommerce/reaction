import Reaction from "/imports/plugins/core/core/server/Reaction";

Reaction.registerPackage({
  label: "Search UI",
  name: "reaction-ui-search",
  icon: "fa fa-search",
  autoEnable: true,
  registry: [
    {
      name: "Search Modal",
      provides: ["ui-search"],
      template: "searchModal"
    }
  ]
});
