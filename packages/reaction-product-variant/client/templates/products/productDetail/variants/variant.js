/**
 * variant helpers
 */

Template.variant.helpers({
  progressBar: function () {
    if (this.inventoryPercentage <= 10) {
      return "progress-bar-danger";
    } else if (this.inventoryPercentage <= 30) {
      return "progress-bar-warning";
    }
    return "progress-bar-success";
  },
  selectedVariant: function () {
    const current = ReactionProduct.selectedVariant();
    if (this._id === (typeof current === "object" ? current._id : void 0) ||
      this._id === (typeof current === "object" ? current.parentId : void 0)) {
      return "variant-detail-selected";
    }
  },
  displayPrice: function () {
    return ReactionProduct.getVariantPriceRange(this._id);
  },
  isSoldOut: function () {
    if (this.inventoryQuantity < 1) {
      return true;
    }
    return false;
  }
});

/**
 * variant events
 */

Template.variant.events({
  "click .variant-edit": function () {
    ReactionProduct.setCurrentVariant(this._id);
    return toggleSession("variant-form-" + this._id);
  },
  "dblclick .variant-detail": function () {
    if (ReactionCore.hasPermission("createProduct")) {
      ReactionProduct.setCurrentVariant(this._id);
      return toggleSession("variant-form-" + this._id);
    }
  },
  "click .variant-detail > *": function (event) {
    event.preventDefault();
    event.stopPropagation();
    Alerts.removeSeen();
    return ReactionProduct.setCurrentVariant(this._id);
  }
});

/**
 * variant onRendered
 */

Template.variant.onRendered(function () {
  return this.autorun(function () {
    let variantSort;
    if (ReactionCore.hasPermission("createProduct")) {
      variantSort = $(".variant-list");
      return variantSort.sortable({
        items: "> li.variant-list-item",
        cursor: "move",
        opacity: 0.3,
        helper: "clone",
        placeholder: "variant-sortable",
        forcePlaceholderSize: true,
        axis: "y",
        update: function () {
          const product = ReactionProduct.selectedProduct();
          const newVariants = [];
          const productVariants = product.variants;
          // fetch uiPositions
          let uiPositions = $(this).sortable("toArray", {
            attribute: "data-id"
          });
          // get variants of the new order
          for (let id of uiPositions) {
            for (let variant of productVariants) {
              if (variant._id === id) {
                newVariants.push(variant);
              }
            }
          }
          // merge and delete old variants to create a newly ordered Array
          // could have (and did do previously) this a lot of different ways
          let updateVariants = _.uniq(_.union(newVariants, productVariants));
          return Meteor.defer(function () {
            return Meteor.call("products/updateVariants",
              updateVariants);
          });
        },
        start: function (event, ui) {
          ui.placeholder.height(ui.helper.height());
          ui.placeholder.html("Drop variant to reorder");
          ui.placeholder.css("padding-top", ui.helper.height() /
            3);
          ui.placeholder.css("border", "1px dashed #ccc");
          return ui.placeholder.css("border-radius", "6px");
        }
      });
    }
  });
});
