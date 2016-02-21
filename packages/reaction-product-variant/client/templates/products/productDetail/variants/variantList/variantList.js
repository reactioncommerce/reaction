/**
 * variantList helpers
 */
Template.variantList.helpers({
  variants: function () {
    let inventoryTotal = 0;
    const variants = [];
    const product = ReactionProduct.selectedProduct();

    if (product) {
      // top level variants
      for (let variant of product.variants) {
        if (!variant.parentId) {
          variants.push(variant);
        }
      }
      // calculate inventory total for all variants
      for (let variant of variants) {
        if (!isNaN(variant.inventoryQuantity)) {
          inventoryTotal += variant.inventoryQuantity;
        }
      }
      // calculate percentage of total inventory of this product
      for (let variant of variants) {
        variant.inventoryTotal = inventoryTotal;
        variant.inventoryPercentage = parseInt(variant.inventoryQuantity /
          inventoryTotal * 100, 10);
        if (variant.title) {
          variant.inventoryWidth = parseInt(variant.inventoryPercentage -
            variant.title.length, 10);
        } else {
          variant.inventoryWidth = 0;
        }
      }
      return variants;
    }
  },
  childVariants: function () {
    const variants = [];
    const product = ReactionProduct.selectedProduct();

    if (product) {
      let current = ReactionProduct.selectedVariant();
      if (typeof current === "object" ? current._id : void 0) {
        if (current.parentId) {
          for (let variant of product.variants) {
            if (variant.parentId === current.parentId && variant.optionTitle &&
              variant.type !== "inventory") {
              variants.push(variant);
            }
          }
        } else {
          for (let variant of product.variants) {
            if (variant.parentId === current._id && variant.optionTitle &&
              variant.type !== "inventory") {
              variants.push(variant);
            }
          }
        }
      }
      return variants;
    }
  }
});

/**
 * variantList events
 */

Template.variantList.events({
  "click #create-variant": function () {
    return Meteor.call("products/createVariant", this._id);
  },
  "click .variant-select-option": function (event, template) {
    template.$(".variant-select-option").removeClass("active");
    $(event.target).addClass("active");
    Alerts.removeSeen();
    return ReactionProduct.setCurrentVariant(this._id);
  }
});
