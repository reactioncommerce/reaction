// /**
//  * searchGridNotice helpers
//  */
// Template.searchGridNotice.helpers({
//   isLowQuantity: function () {
//     return this.isLowQuantity;
//   },
//   isSoldOut: function () {
//     return this.isSoldOut;
//   },
//   isBackorder: function () {
//     return this.isBackorder;
//   }
// });



import { ReactionProduct } from "/lib/api";
import { Catalog } from "/lib/api";

/**
 * searchGridNotice helpers
 */
Template.searchGridNotice.helpers({
  isLowQuantity: function () {
    const topVariants = ReactionProduct.getTopVariants(this.product._id);

    for (const topVariant of topVariants) {
      const inventoryThreshold = topVariant.lowInventoryWarningThreshold;
      const inventoryQuantity = ReactionProduct.getVariantQuantity(topVariant);

      if (inventoryQuantity !== 0 && inventoryThreshold >= inventoryQuantity) {
        return true;
      }
    }
    return false;
  },
  isSoldOut: function () {
    const topVariants = ReactionProduct.getTopVariants(this.product._id);

    for (const topVariant of topVariants) {
      const inventoryQuantity = ReactionProduct.getVariantQuantity(topVariant);

      if (inventoryQuantity > 0) {
        return false;
      }
    }
    return true;
  },
  isBackorder: function () {
    return this.isBackorder;
  }
});
