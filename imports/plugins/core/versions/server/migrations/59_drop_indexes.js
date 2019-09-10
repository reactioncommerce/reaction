import { Migrations } from "meteor/percolate:migrations";
import { MongoInternals } from "meteor/mongo";
import Logger from "@reactioncommerce/logger";
import rawCollections from "/imports/collections/rawCollections";

const { db } = MongoInternals.defaultRemoteCollectionDriver().mongo;

const Inventory = db.collection("Inventory");
const Translations = db.collection("Translations");

/**
 * @private
 * @param {Error} error Error or null
 * @returns {undefined}
 */
function handleError(error) {
  // This may fail if the index or the collection doesn't exist, which is what we want anyway
  if (
    error &&
    (
      typeof error.message !== "string" ||
      (!error.message.includes("index not found") && !error.message.includes("ns not found"))
    )
  ) {
    Logger.warn(error, "Caught error from dropIndex calls in migration 59");
  }
}

/**
 * Drop all indexes that support queries that are no longer expected
 * to be made by any plugins, or that are already supported by other
 * indexes.
 */
Migrations.add({
  version: 59,
  up() {
    const {
      Accounts,
      Cart,
      Discounts,
      Orders,
      Packages,
      Products,
      Shops
    } = rawCollections;

    Accounts.dropIndex("c2_sessions", handleError);

    Cart.dropIndex("c2_billing.$.paymentMethod.items.$.productId", handleError);
    Cart.dropIndex("c2_billing.$.paymentMethod.items.$.shopId", handleError);
    Cart.dropIndex("c2_billing.$.paymentMethod.workflow.status", handleError);
    Cart.dropIndex("c2_email", handleError);
    Cart.dropIndex("c2_items.$.product.ancestors", handleError);
    Cart.dropIndex("c2_items.$.product.createdAt", handleError);
    Cart.dropIndex("c2_items.$.product.handle", handleError);
    Cart.dropIndex("c2_items.$.product.hashtags", handleError);
    Cart.dropIndex("c2_items.$.product.isDeleted", handleError);
    Cart.dropIndex("c2_items.$.product.isVisible", handleError);
    Cart.dropIndex("c2_items.$.product.shopId", handleError);
    Cart.dropIndex("c2_items.$.product.workflow.status", handleError);
    Cart.dropIndex("c2_items.$.shopId", handleError);
    Cart.dropIndex("c2_items.$.variants.isDeleted", handleError);
    Cart.dropIndex("c2_items.$.variants.isVisible", handleError);
    Cart.dropIndex("c2_items.$.variants.shopId", handleError);
    Cart.dropIndex("c2_items.$.variants.workflow.status", handleError);
    Cart.dropIndex("c2_sessionId", handleError);
    Cart.dropIndex("c2_shipping.$.items.$.productId", handleError);
    Cart.dropIndex("c2_shipping.$.items.$.shopId", handleError);
    Cart.dropIndex("c2_shipping.$.workflow.status", handleError);
    Cart.dropIndex("c2_workflow.status", handleError);

    Discounts.dropIndex("c2_calculation.method", handleError);
    Discounts.dropIndex("c2_discountMethod", handleError);
    Discounts.dropIndex("c2_transactions.$.cartId", handleError);
    Discounts.dropIndex("c2_transactions.$.userId", handleError);

    Inventory.dropIndex("c2_orderItemId", handleError);
    Inventory.dropIndex("c2_productId", handleError);
    Inventory.dropIndex("c2_shopId", handleError);
    Inventory.dropIndex("c2_variantId", handleError);
    Inventory.dropIndex("c2_workflow.status", handleError);

    Orders.dropIndex("c2_accountId", handleError);
    Orders.dropIndex("c2_anonymousAccessToken", handleError);
    Orders.dropIndex("c2_billing.$.paymentMethod.items.$.productId", handleError);
    Orders.dropIndex("c2_billing.$.paymentMethod.items.$.shopId", handleError);
    Orders.dropIndex("c2_billing.$.paymentMethod.workflow.status", handleError);
    Orders.dropIndex("c2_items.$.product.ancestors", handleError);
    Orders.dropIndex("c2_items.$.product.createdAt", handleError);
    Orders.dropIndex("c2_items.$.product.handle", handleError);
    Orders.dropIndex("c2_items.$.product.hashtags", handleError);
    Orders.dropIndex("c2_items.$.product.isDeleted", handleError);
    Orders.dropIndex("c2_items.$.product.isVisible", handleError);
    Orders.dropIndex("c2_items.$.product.shopId", handleError);
    Orders.dropIndex("c2_items.$.product.workflow.status", handleError);
    Orders.dropIndex("c2_items.$.shopId", handleError);
    Orders.dropIndex("c2_items.$.variants.isDeleted", handleError);
    Orders.dropIndex("c2_items.$.variants.isVisible", handleError);
    Orders.dropIndex("c2_items.$.variants.shopId", handleError);
    Orders.dropIndex("c2_items.$.variants.workflow.status", handleError);
    Orders.dropIndex("c2_items.$.workflow.status", handleError);
    Orders.dropIndex("c2_sessionId", handleError);
    Orders.dropIndex("c2_shipping.$.items.$.productId", handleError);
    Orders.dropIndex("c2_shipping.$.items.$.shopId", handleError);
    Orders.dropIndex("c2_shipping.$.items.$.variantId", handleError);
    Orders.dropIndex("c2_shipping.$.items.$.workflow.status", handleError);
    Orders.dropIndex("c2_shipping.$.workflow.status", handleError);

    Packages.dropIndex("c2_layout.$.layout", handleError);
    Packages.dropIndex("c2_layout.$.structure.adminControlsFooter", handleError);
    Packages.dropIndex("c2_layout.$.structure.dashboardControls", handleError);
    Packages.dropIndex("c2_layout.$.structure.dashboardHeader", handleError);
    Packages.dropIndex("c2_layout.$.structure.dashboardHeaderControls", handleError);
    Packages.dropIndex("c2_layout.$.structure.layoutFooter", handleError);
    Packages.dropIndex("c2_layout.$.structure.layoutHeader", handleError);
    Packages.dropIndex("c2_layout.$.structure.notFound", handleError);
    Packages.dropIndex("c2_layout.$.structure.template", handleError);
    Packages.dropIndex("c2_name", handleError);
    Packages.dropIndex("c2_registry.$.name", handleError);
    Packages.dropIndex("c2_registry.$.route", handleError);
    Packages.dropIndex("c2_shopId", handleError);

    Products.dropIndex("c2_isDeleted", handleError);
    Products.dropIndex("c2_isVisible", handleError);

    Shops.dropIndex("c2_active", handleError);
    Shops.dropIndex("c2_layout.$.layout", handleError);
    Shops.dropIndex("c2_layout.$.structure.adminControlsFooter", handleError);
    Shops.dropIndex("c2_layout.$.structure.dashboardControls", handleError);
    Shops.dropIndex("c2_layout.$.structure.dashboardHeader", handleError);
    Shops.dropIndex("c2_layout.$.structure.dashboardHeaderControls", handleError);
    Shops.dropIndex("c2_layout.$.structure.layoutFooter", handleError);
    Shops.dropIndex("c2_layout.$.structure.layoutHeader", handleError);
    Shops.dropIndex("c2_layout.$.structure.notFound", handleError);
    Shops.dropIndex("c2_layout.$.structure.template", handleError);
    Shops.dropIndex("c2_shopType", handleError);
    Shops.dropIndex("c2_workflow.status", handleError);

    Translations.dropIndex("c2_i18n", handleError);
    Translations.dropIndex("c2_shopId", handleError);
  }
});
