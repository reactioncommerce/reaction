import Reaction from "/imports/plugins/core/core/server/Reaction";
import mutations from "./server/no-meteor/mutations";
import schema from "./server/no-meteor/schema.graphql";
import queries from "./server/no-meteor/queries";
import resolvers from "./server/no-meteor/resolvers";
import startup from "./server/no-meteor/startup";

Reaction.registerPackage({
  label: "Shipping",
  name: "reaction-shipping",
  icon: "fa fa-truck",
  autoEnable: true,
  graphQL: {
    resolvers,
    schemas: [schema]
  },
  queries,
  mutations,
  startupFunctions: [startup],
  settings: {
    name: "Shipping",
    shipping: {
      enabled: true
    }
  },
  registry: [
    {
      provides: ["dashboard"],
      route: "/dashboard/shipping",
      name: "shipping",
      label: "Shipping",
      description: "Shipping dashboard",
      icon: "fa fa-truck",
      priority: 1,
      container: "core",
      workflow: "coreDashboardWorkflow"
    },
    {
      provides: ["settings"],
      name: "settings/shipping",
      label: "Shipping",
      description: "Configure shipping",
      icon: "fa fa-truck",
      template: "shippingSettings"
    }
  ]
});
