import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Products } from "/lib/collections";


/**
 * Given a list of variants in an ancestor chain, finds the bottommost variant
 * @private
 * @method findBottomVariant
 * @param  {[Object]} variants Array of variant objects
 * @return {Object} Bottommost variant object
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
  "shopify/sync/orders/created": (lineItems) => {
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
            description: `Shopify order created which caused inventory to be reduced by ${lineItem.quantity}`
          }
        }
      }, { selector: { type: "variant" } });
    });
  }
};

Meteor.methods(methods);
