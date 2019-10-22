import i18n from "./i18n/index.js";
import mutations from "./mutations/index.js";
import queries from "./queries/index.js";
import { registerPluginHandler } from "./registration.js";
import resolvers from "./resolvers/index.js";
import schemas from "./schemas/index.js";

/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {ReactionNodeApp} app The ReactionNodeApp instance
 * @returns {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "Payments",
    name: "reaction-payments",
    i18n,
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
