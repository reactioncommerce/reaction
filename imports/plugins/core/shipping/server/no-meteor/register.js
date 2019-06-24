import mutations from "./mutations";
import queries from "./queries";
import resolvers from "./resolvers";
import schemas from "./schemas";
import startup from "./startup";

/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {ReactionNodeApp} app The ReactionNodeApp instance
 * @return {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "Shipping",
    name: "reaction-shipping",
    icon: "fa fa-truck",
    functionsByType: {
      startup: [startup]
    },
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
