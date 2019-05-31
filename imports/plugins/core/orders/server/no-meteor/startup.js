import collectionIndex from "/imports/utils/collectionIndex";
import sendOrderEmail from "./util/sendOrderEmail";

/**
 * @summary Called on startup
 * @param {Object} context Startup context
 * @param {Object} context.collections Map of MongoDB collections
 * @returns {undefined}
 */
export default function startup(context) {
  const { appEvents, collections } = context;
  const { Orders } = collections;

  // Create indexes. We set specific names for backwards compatibility
  // with indexes created by the aldeed:schema-index Meteor package.
  collectionIndex(Orders, { accountId: 1, shopId: 1 });
  collectionIndex(Orders, { createdAt: -1 }, { name: "c2_createdAt" });
  collectionIndex(Orders, { email: 1 }, { name: "c2_email" });
  collectionIndex(Orders, { referenceId: 1 }, { unique: true });
  collectionIndex(Orders, { shopId: 1 }, { name: "c2_shopId" });
  collectionIndex(Orders, { "shipping.items.productId": 1 });
  collectionIndex(Orders, { "shipping.items.variantId": 1 });
  collectionIndex(Orders, { "workflow.status": 1 }, { name: "c2_workflow.status" });

  appEvents.on("afterOrderCreate", ({ order }) => sendOrderEmail(context, order));
}
