import { ReactionProduct } from "/lib/api";

/**
 * gridNotice helpers
 */
Template.gridNotice.helpers({
  isLowQuantity: function () {
    const topVariants = ReactionProduct.getTopVariants(this._id);

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
    const topVariants = ReactionProduct.getTopVariants(this._id);

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
