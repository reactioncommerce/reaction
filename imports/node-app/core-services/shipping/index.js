import i18n from "./i18n/index.js";
import mutations from "./mutations/index.js";
import queries from "./queries/index.js";
import resolvers from "./resolvers/index.js";
import schemas from "./schemas/index.js";

/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {ReactionNodeApp} app The ReactionNodeApp instance
 * @returns {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "Shipping",
    name: "reaction-shipping",
    i18n,
    graphQL: {
      resolvers,
      schemas
    },
    queries,
    mutations,
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
}
