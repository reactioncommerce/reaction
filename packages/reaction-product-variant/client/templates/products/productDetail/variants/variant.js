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
    const _id = this._id;
    const current = ReactionProduct.selectedVariant();
    if (typeof current === "object" &&
      (_id === current._id || ~current.ancestors.indexOf(this._id))) {
      return "variant-detail-selected";
    }
  },
  displayQuantity: function () {
    return ReactionProduct.getVariantQuantity(this);
  },
  displayPrice: function () {
    return ReactionProduct.getVariantPriceRange(this._id);
  },
  isSoldOut: function () {
    return ReactionProduct.getVariantQuantity(this) < 1;
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
          const uiPositions = $(this).sortable("toArray", {
            attribute: "data-id"
          });
          Meteor.defer(function () {
            Meteor.call("products/updateVariantsPosition", uiPositions);
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
