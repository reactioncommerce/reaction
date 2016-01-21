/**
 * gridNotice helpers
 * @todo update all these helpers to support flattened model
 * @todo currently this functionality not reachable for us, because we not
 * published on variants in `productGrid` only on products.
 */
Template.gridNotice.helpers({
  isLowQuantity: function () {
    const variants = getTopVariants();
    // TODO: what is the logic of this helper?
    if (variants.length > 0) {
      for (let variant of variants) {
        if (variant.inventoryQuantity <= variant.lowInventoryWarningThreshold) {
          return true;
        }
      }
    } else {
      return false;
    }
  },
  isSoldOut: function () {
    const variants = getTopVariants();

    if (variants.length > 0) {
      for (let variant of variants) {
        // todo this is wrong. Current logic works for the first variant only
        if (!variant.inventoryManagement || variant.inventoryQuantity > 0) {
          return false;
        }
      }
      return true;
    }
  },
  isBackorder: function () {
    const variants = getTopVariants();

    if (variants.length > 0) {
      for (let variant of variants) {
        if (!variant.inventoryManagement || variant.inventoryQuantity > 0) {
          return false;
        }
      }
      for (let variant of variants) {
        if (!variant.inventoryPolicy) {
          return true;
        }
      }
      return false;
    }
  }
});
