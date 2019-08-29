import mutations from "./mutations";
import queries from "./queries";
import resolvers from "./resolvers";
import schemas from "./schemas";
import startup from "./startup";
import getDataForOrderEmail from "./util/getDataForOrderEmail";

/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {ReactionNodeApp} app The ReactionNodeApp instance
 * @returns {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "Orders",
    name: "reaction-orders",
    icon: "fa fa-sun-o",
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
          [{ "workflow.status": 1 }, { name: "c2_workflow.status" }]
        ]
      }
    },
    functionsByType: {
      getDataForOrderEmail: [getDataForOrderEmail],
      startup: [startup]
    },
    graphQL: {
      resolvers,
      schemas
    },
    mutations,
    queries,
    settings: {
      name: "Orders"
    },
    registry: [{
      route: "order/fulfillment",
      label: "Order Fulfillment",
      permission: "orderFulfillment",
      name: "order/fulfillment"
    },
    {
      route: "order/view",
      label: "Order View",
      permission: "orderView",
      name: "order/view"
    }],
    layout: []
  });
}
