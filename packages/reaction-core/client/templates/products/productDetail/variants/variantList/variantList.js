/**
 * variantList helpers
 */
Template.variantList.helpers({
  variants: function () {
    let inventoryTotal = 0;
    const variants = getTopVariants();

    if (variants.length > 0) {
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
    const childVariants = [];
    const variants = getVariants();
    if (variants.length > 0) {
      const current = selectedVariant();

      if (! current) {
        return;
      }

      if (current.ancestors.length === 1) {
        variants.map(variant => {
          if (typeof variant.ancestors[1] === "string" &&
            variant.ancestors[1] === current._id &&
            variant.optionTitle &&
            variant.type !== "inventory") {
            childVariants.push(variant);
          }
          //}
        });
      } else {
        // TODO not sure we need this part...
        variants.map(variant => {
          if (typeof variant.ancestors[1] === "string" &&
            variant.ancestors.length === current.ancestors.length &&
            variant.ancestors[1] === current.ancestors[1] &&
            variant.optionTitle
          ) {
            childVariants.push(variant);
          }
        });
      }

      return childVariants;
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
    return setCurrentVariant(this._id);
  }
});
