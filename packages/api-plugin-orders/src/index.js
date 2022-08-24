import pkg from "../package.json";
import i18n from "./i18n/index.js";
import mutations from "./mutations/index.js";
import policies from "./policies.json";
import preStartup from "./preStartup.js";
import queries from "./queries/index.js";
import resolvers from "./resolvers/index.js";
import schemas from "./schemas/index.js";
import { Order, OrderFulfillmentGroup, OrderItem } from "./simpleSchemas.js";
import startup from "./startup.js";
import getDataForOrderEmail from "./util/getDataForOrderEmail.js";

/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {ReactionAPI} app The ReactionAPI instance
 * @returns {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "Orders",
    name: "orders",
    version: pkg.version,
    i18n,
    collections: {
      Orders: {
        name: "Orders",
        indexes: [
          // Create indexes. We set specific names for backwards compatibility
          // with indexes created by the aldeed:schema-index Meteor package.
          [{ accountId: 1, shopId: 1 }],
          [{ createdAt: -1 }, { name: "c2_createdAt" }],
          [{ email: 1 }, { name: "c2_email" }],
          [{ referenceId: 1 }, { unique: true }],
          [{ shopId: 1 }, { name: "c2_shopId" }],
          [{ "shipping.items.productId": 1 }],
          [{ "shipping.items.variantId": 1 }],
          [{ "payments.address.fullName": 1 }],
          [{ "shipping.address.fullName": 1 }],
          [{ "payments.address.phone": 1 }],
          [{ "workflow.status": 1 }, { name: "c2_workflow.status" }]
        ]
      }
    },
    functionsByType: {
      getDataForOrderEmail: [getDataForOrderEmail],
      preStartup: [preStartup],
      startup: [startup]
    },
    graphQL: {
      resolvers,
      schemas
    },
    mutations,
    queries,
    policies,
    simpleSchemas: {
      Order,
      OrderFulfillmentGroup,
      OrderItem
    }
  });
}
