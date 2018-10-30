import Reaction from "/imports/plugins/core/core/server/Reaction";
import publishProductToCatalog from "./server/no-meteor/publishProductToCatalog";
import { registerPluginHandler } from "./server/no-meteor/registration";
import mutations from "./server/no-meteor/mutations";
import queries from "./server/no-meteor/queries";
import resolvers from "./server/no-meteor/resolvers";
import schemas from "./server/no-meteor/schemas";
import startup from "./server/no-meteor/startup";

Reaction.registerPackage({
  label: "Taxes",
  name: "reaction-taxes",
  icon: "fa fa-university",
  autoEnable: true,
  catalog: {
    customPublishedProductVariantFields: ["isTaxable", "taxCode", "taxDescription"]
  },
  functionsByType: {
    publishProductToCatalog: [publishProductToCatalog],
    registerPluginHandler: [registerPluginHandler],
    startup: [startup]
  },
  graphQL: {
    schemas,
    resolvers
  },
  mutations,
  queries,
  registry: [
    {
      provides: ["dashboard"],
      name: "taxes",
      label: "Taxes",
      description: "Provide tax rates",
      icon: "fa fa-university",
      priority: 1,
      container: "core",
      workflow: "coreDashboardWorkflow"
    },
    {
      label: "Tax Settings",
      icon: "fa fa-university",
      name: "taxes/settings",
      provides: ["settings"],
      template: "taxSettings"
    }
  ]
});
