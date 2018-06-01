import { check } from "meteor/check";
import { Hooks } from "/server/api";
import { Products } from "/lib/collections";

/**
 * @file Methods for syncing Shopify orders
 *       contains methods and helpers for synchronization of orders between a Shopify store and a Reaction shop
 * @module connectors-shopify
 */

/**
 * Given a list of variants in an ancestor chain, finds the bottommost variant
 * @private
 * @method findBottomVariant
 * @param  {array} variants Array of variant objects
 * @return {object} Bottommost variant object
 */
function findBottomVariant(variants) {
  return variants.reduce((bottomVariant, variant) => {
    if (!bottomVariant.ancestors || !Array.isArray(bottomVariant.ancestors)) {
      return variant;
    }
    if (Array.isArray(variant.ancestors)) {
      if (variant.ancestors.length > bottomVariant.ancestors.length) {
        return variant;
      }
    }
    return bottomVariant;
  });
}

export const methods = {
  /**
   * Given an array of line items from a Shopify order, this method updates the inventory quantity for all variants
   * in the Reaction store which have a matching shopifyId to the line items in the order
   * @method connectors/shopify/sync/orders/created
   * @param {object} lineItems array of line items from a Shopify order
   * @returns {undefined}
   */
  adjustInventory: (lineItems) => {
    check(lineItems, [Object]);

    lineItems.forEach((lineItem) => {
      const variantsWithShopifyId = Products.find({ shopifyId: lineItem.variant_id }).fetch();

      // iterate through the variants that match this shopifyId
      // return the one with the longest list of ancestors
      const variant = findBottomVariant(variantsWithShopifyId);

      // adjust inventory for variant and push an event into the eventLog
      Products.update({
        _id: variant._id
      }, {
        $inc: { inventoryQuantity: (lineItem.quantity * -1) },
        $push: {
          eventLog: {
            title: "Product inventory updated by Shopify webhook",
            type: "update-webhook",
            description: `Shopify order created which caused inventory to be reduced by ${lineItem.quantity}`,
            createdAt: new Date()
          }
        }
      }, { selector: { type: "variant" }, publish: true });
      Hooks.Events.run("afterUpdateCatalogProduct", variant);
    });
  }
};
