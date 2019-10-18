import i18n from "./i18n/index.js";
import mutateNewOrderItemBeforeCreate from "./mutateNewOrderItemBeforeCreate.js";
import mutateNewVariantBeforeCreate from "./mutateNewVariantBeforeCreate.js";
import publishProductToCatalog from "./publishProductToCatalog.js";
import { registerPluginHandler } from "./registration.js";
import mutations from "./mutations/index.js";
import preStartup from "./preStartup.js";
import queries from "./queries/index.js";
import resolvers from "./resolvers/index.js";
import schemas from "./schemas/index.js";
import setTaxesOnCart from "./util/setTaxesOnCart.js";

/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {ReactionNodeApp} app The ReactionNodeApp instance
 * @returns {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "Taxes",
    name: "reaction-taxes",
    i18n,
    cart: {
      transforms: [
        {
          name: "setTaxesOnCart",
          fn: setTaxesOnCart,
          priority: 30
        }
      ]
    },
    catalog: {
      publishedProductVariantFields: ["isTaxable", "taxCode", "taxDescription"]
    },
    functionsByType: {
      mutateNewOrderItemBeforeCreate: [mutateNewOrderItemBeforeCreate],
      mutateNewVariantBeforeCreate: [mutateNewVariantBeforeCreate],
      preStartup: [preStartup],
      publishProductToCatalog: [publishProductToCatalog],
      registerPluginHandler: [registerPluginHandler]
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
