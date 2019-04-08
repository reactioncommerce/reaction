import collectionIndex from "/imports/utils/collectionIndex";

/**
 * @summary Called on startup
 * @param {Object} context Startup context
 * @param {Object} context.collections Map of MongoDB collections
 * @returns {undefined}
 */
export default function startup(context) {
  const { collections } = context;
  const { Orders } = collections;

  // Create indexes. We set specific names for backwards compatibility
  // with indexes created by the aldeed:schema-index Meteor package.
  collectionIndex(Orders, { accountId: 1 }, { name: "c2_accountId" });
  collectionIndex(Orders, { anonymousAccessToken: 1 }, { name: "c2_anonymousAccessToken" });
  collectionIndex(Orders, { createdAt: -1 }, { name: "c2_createdAt" });
  collectionIndex(Orders, { email: 1 }, { name: "c2_email" });
  collectionIndex(Orders, { referenceId: 1 }, { unique: true });
  collectionIndex(Orders, { sessionId: 1 }, { name: "c2_sessionId" });
  collectionIndex(Orders, { shopId: 1 }, { name: "c2_shopId" });
  collectionIndex(Orders, { "items.productId": 1 }, { name: "c2_items.$.productId" });
  collectionIndex(Orders, { "items.shopId": 1 }, { name: "c2_items.$.shopId" });
  collectionIndex(Orders, { "items.product.ancestors": 1 }, { name: "c2_items.$.product.ancestors" });
  collectionIndex(Orders, { "items.product.shopId": 1 }, { name: "c2_items.$.product.shopId" });
  collectionIndex(Orders, { "items.product.hashtags": 1 }, { name: "c2_items.$.product.hashtags" });
  collectionIndex(Orders, { "items.product.handle": 1 }, { name: "c2_items.$.product.handle" });
  collectionIndex(Orders, { "items.product.isDeleted": 1 }, { name: "c2_items.$.product.isDeleted" });
  collectionIndex(Orders, { "items.product.isVisible": 1 }, { name: "c2_items.$.product.isVisible" });
  collectionIndex(Orders, { "items.product.createdAt": 1 }, { name: "c2_items.$.product.createdAt" });
  collectionIndex(Orders, { "items.product.workflow.status": 1 }, { name: "c2_items.$.product.workflow.status" });
  collectionIndex(Orders, { "items.variantId": 1 }, { name: "c2_items.$.variantId" });
  collectionIndex(Orders, { "items.variants.isVisible": 1 }, { name: "c2_items.$.variants.isVisible" });
  collectionIndex(Orders, { "items.variants.isDeleted": 1 }, { name: "c2_items.$.variants.isDeleted" });
  collectionIndex(Orders, { "items.variants.shopId": 1 }, { name: "c2_items.$.variants.shopId" });
  collectionIndex(Orders, { "items.variants.workflow.status": 1 }, { name: "c2_items.$.variants.workflow.status" });
  collectionIndex(Orders, { "items.workflow.status": 1 }, { name: "c2_items.$.workflow.status" });
  collectionIndex(Orders, { "billing.paymentMethod.workflow.status": 1 }, { name: "c2_billing.$.paymentMethod.workflow.status" });
  collectionIndex(Orders, { "billing.paymentMethod.items.productId": 1 }, { name: "c2_billing.$.paymentMethod.items.$.productId" });
  collectionIndex(Orders, { "billing.paymentMethod.items.shopId": 1 }, { name: "c2_billing.$.paymentMethod.items.$.shopId" });
  collectionIndex(Orders, { "shipping.items.productId": 1 }, { name: "c2_shipping.$.items.$.productId" });
  collectionIndex(Orders, { "shipping.items.shopId": 1 }, { name: "c2_shipping.$.items.$.shopId" });
  collectionIndex(Orders, { "shipping.items.variantId": 1 }, { name: "c2_shipping.$.items.$.variantId" });
  collectionIndex(Orders, { "shipping.items.workflow.status": 1 }, { name: "c2_shipping.$.items.$.workflow.status" });
  collectionIndex(Orders, { "shipping.workflow.status": 1 }, { name: "c2_shipping.$.workflow.status" });
  collectionIndex(Orders, { "workflow.status": 1 }, { name: "c2_workflow.status" });
}
