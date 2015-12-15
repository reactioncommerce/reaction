/**
 * gridNotice helpers
 */

Template.gridNotice.helpers({
  isLowQuantity: function () {
    let variants = [];
    for (let variant of this.variants) {
      if (!variant.parentId) {
        variants.push(variant);
      }
    }
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
    let variants = [];
    for (let variant of this.variants) {
      if (!variant.parentId) {
        variants.push(variant);
      }
    }

    if (variants.length > 0) {
      for (let variant of variants) {
        if (!variant.inventoryManagement || variant.inventoryQuantity > 0) {
          return false;
        }
      }
      return true;
    }
  },
  isBackorder: function () {
    let variants = [];
    for (let variant of this.variants) {
      if (!variant.parentId) {
        variants.push(variant);
      }
    }
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
