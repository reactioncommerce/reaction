import Reaction from "/imports/plugins/core/core/server/Reaction";
import { registerPluginHandler } from "./server/no-meteor/registration";
import mutations from "./server/no-meteor/mutations";
import queries from "./server/no-meteor/queries";
import resolvers from "./server/no-meteor/resolvers";
import schemas from "./server/no-meteor/schemas";

Reaction.registerPackage({
  label: "Payments",
  name: "reaction-payments",
  icon: "fa fa-credit-card",
  autoEnable: true,
  functionsByType: {
    registerPluginHandler: [registerPluginHandler]
  },
  graphQL: {
    resolvers,
    schemas
  },
  queries,
  mutations,
  settings: {
    payments: {
      enabled: true
    }
  },
  registry: [
    {
      provides: ["dashboard"],
      name: "payments",
      label: "Payments",
      description: "Payment Methods",
      icon: "fa fa-credit-card",
      priority: 1,
      container: "core",
      workflow: "coreDashboardWorkflow"
    },
    {
      label: "Payment Settings",
      icon: "fa fa-credit-card",
      name: "payment/settings",
      provides: ["settings"],
      template: "paymentSettings"
    }
  ]
});
