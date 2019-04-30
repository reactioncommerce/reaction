import { Migrations } from "meteor/percolate:migrations";
import { MongoInternals } from "meteor/mongo";
import Logger from "@reactioncommerce/logger";
import rawCollections from "/imports/collections/rawCollections";

const { db } = MongoInternals.defaultRemoteCollectionDriver().mongo;

const Inventory = db.collection("Inventory");

const {
  Accounts,
  Cart,
  Discounts,
  Orders,
  Packages,
  Products,
  Shops,
  Translations
} = rawCollections;

/**
 * Drop all indexes that support queries that are no longer expected
 * to be made by any plugins, or that are already supported by other
 * indexes.
 */
Migrations.add({
  version: 59,
  up() {
    try {
      Accounts.dropIndex("c2_sessions");

      Cart.dropIndex("c2_billing.$.paymentMethod.items.$.productId");
      Cart.dropIndex("c2_billing.$.paymentMethod.items.$.shopId");
      Cart.dropIndex("c2_billing.$.paymentMethod.workflow.status");
      Cart.dropIndex("c2_email");
      Cart.dropIndex("c2_items.$.product.ancestors");
      Cart.dropIndex("c2_items.$.product.createdAt");
      Cart.dropIndex("c2_items.$.product.handle");
      Cart.dropIndex("c2_items.$.product.hashtags");
      Cart.dropIndex("c2_items.$.product.isDeleted");
      Cart.dropIndex("c2_items.$.product.isVisible");
      Cart.dropIndex("c2_items.$.product.shopId");
      Cart.dropIndex("c2_items.$.product.workflow.status");
      Cart.dropIndex("c2_items.$.shopId");
      Cart.dropIndex("c2_items.$.variants.isDeleted");
      Cart.dropIndex("c2_items.$.variants.isVisible");
      Cart.dropIndex("c2_items.$.variants.shopId");
      Cart.dropIndex("c2_items.$.variants.workflow.status");
      Cart.dropIndex("c2_sessionId");
      Cart.dropIndex("c2_shipping.$.items.$.productId");
      Cart.dropIndex("c2_shipping.$.items.$.shopId");
      Cart.dropIndex("c2_shipping.$.workflow.status");
      Cart.dropIndex("c2_workflow.status");

      Discounts.dropIndex("c2_calculation.method");
      Discounts.dropIndex("c2_discountMethod");
      Discounts.dropIndex("c2_transactions.$.cartId");
      Discounts.dropIndex("c2_transactions.$.userId");

      Inventory.dropIndex("c2_orderItemId");
      Inventory.dropIndex("c2_productId");
      Inventory.dropIndex("c2_shopId");
      Inventory.dropIndex("c2_variantId");
      Inventory.dropIndex("c2_workflow.status");

      Orders.dropIndex("c2_accountId");
      Orders.dropIndex("c2_anonymousAccessToken");
      Orders.dropIndex("c2_billing.$.paymentMethod.items.$.productId");
      Orders.dropIndex("c2_billing.$.paymentMethod.items.$.shopId");
      Orders.dropIndex("c2_billing.$.paymentMethod.workflow.status");
      Orders.dropIndex("c2_items.$.product.ancestors");
      Orders.dropIndex("c2_items.$.product.createdAt");
      Orders.dropIndex("c2_items.$.product.handle");
      Orders.dropIndex("c2_items.$.product.hashtags");
      Orders.dropIndex("c2_items.$.product.isDeleted");
      Orders.dropIndex("c2_items.$.product.isVisible");
      Orders.dropIndex("c2_items.$.product.shopId");
      Orders.dropIndex("c2_items.$.product.workflow.status");
      Orders.dropIndex("c2_items.$.shopId");
      Orders.dropIndex("c2_items.$.variants.isDeleted");
      Orders.dropIndex("c2_items.$.variants.isVisible");
      Orders.dropIndex("c2_items.$.variants.shopId");
      Orders.dropIndex("c2_items.$.variants.workflow.status");
      Orders.dropIndex("c2_items.$.workflow.status");
      Orders.dropIndex("c2_sessionId");
      Orders.dropIndex("c2_shipping.$.items.$.productId");
      Orders.dropIndex("c2_shipping.$.items.$.shopId");
      Orders.dropIndex("c2_shipping.$.items.$.variantId");
      Orders.dropIndex("c2_shipping.$.items.$.workflow.status");
      Orders.dropIndex("c2_shipping.$.workflow.status");

      Packages.dropIndex("c2_layout.$.layout");
      Packages.dropIndex("c2_layout.$.structure.adminControlsFooter");
      Packages.dropIndex("c2_layout.$.structure.dashboardControls");
      Packages.dropIndex("c2_layout.$.structure.dashboardHeader");
      Packages.dropIndex("c2_layout.$.structure.dashboardHeaderControls");
      Packages.dropIndex("c2_layout.$.structure.layoutFooter");
      Packages.dropIndex("c2_layout.$.structure.layoutHeader");
      Packages.dropIndex("c2_layout.$.structure.notFound");
      Packages.dropIndex("c2_layout.$.structure.template");
      Packages.dropIndex("c2_name");
      Packages.dropIndex("c2_registry.$.name");
      Packages.dropIndex("c2_registry.$.route");
      Packages.dropIndex("c2_shopId");

      Products.dropIndex("c2_isDeleted");
      Products.dropIndex("c2_isVisible");

      Shops.dropIndex("c2_active");
      Shops.dropIndex("c2_layout.$.layout");
      Shops.dropIndex("c2_layout.$.structure.adminControlsFooter");
      Shops.dropIndex("c2_layout.$.structure.dashboardControls");
      Shops.dropIndex("c2_layout.$.structure.dashboardHeader");
      Shops.dropIndex("c2_layout.$.structure.dashboardHeaderControls");
      Shops.dropIndex("c2_layout.$.structure.layoutFooter");
      Shops.dropIndex("c2_layout.$.structure.layoutHeader");
      Shops.dropIndex("c2_layout.$.structure.notFound");
      Shops.dropIndex("c2_layout.$.structure.template");
      Shops.dropIndex("c2_shopType");
      Shops.dropIndex("c2_workflow.status");

      Translations.dropIndex("c2_i18n");
      Translations.dropIndex("c2_shopId");
    } catch (error) {
      // This may fail if the index doesn't exist, which is what we want anyway
      Logger.warn(error, "Caught error from dropIndex calls in migration 59");
    }
  }
});
