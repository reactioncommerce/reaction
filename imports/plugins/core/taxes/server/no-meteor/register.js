import mutateNewOrderItemBeforeCreate from "./mutateNewOrderItemBeforeCreate";
import mutateNewVariantBeforeCreate from "./mutateNewVariantBeforeCreate";
import publishProductToCatalog from "./publishProductToCatalog";
import { registerPluginHandler } from "./registration";
import mutations from "./mutations";
import queries from "./queries";
import resolvers from "./resolvers";
import schemas from "./schemas";
import startup from "./startup";

/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {ReactionNodeApp} app The ReactionNodeApp instance
 * @returns {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "Taxes",
    name: "reaction-taxes",
    icon: "fa fa-university",
    catalog: {
      publishedProductVariantFields: ["isTaxable", "taxCode", "taxDescription"]
    },
    functionsByType: {
      mutateNewOrderItemBeforeCreate: [mutateNewOrderItemBeforeCreate],
      mutateNewVariantBeforeCreate: [mutateNewVariantBeforeCreate],
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
}
