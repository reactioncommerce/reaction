import Reaction from "/imports/plugins/core/core/server/Reaction";

Reaction.registerPackage({
  label: "Plugin-Versions",
  name: "reaction-plugin-versions",
  version: "1.0",
  icon: "fa fa-vines",
  autoEnable: true,
  registry: [{
    provides: ["dashboard"],
    label: "Plugin Versions",
    description: "Plugin Versions",
    icon: "fa fa-vines",
    template: "PluginVersionsSettings"
  }]
});
