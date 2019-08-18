import mutations from "./mutations";
import queries from "./queries";
import { registerPluginHandler } from "./registration";
import resolvers from "./resolvers";
import schemas from "./schemas";

/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {ReactionNodeApp} app The ReactionNodeApp instance
 * @returns {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "Payments",
    name: "reaction-payments",
    icon: "fa fa-credit-card",
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
}
