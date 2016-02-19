/**
 * variantForm helpers
 */

Template.variantForm.helpers({
  variantDetails: function () {
    if (this.ancestors.length === 1) {
      return Template.parentVariantForm;
    }
    return Template.childVariantForm;
  },
  childVariants: function () {
    const _id = this._id;
    const variants = ReactionProduct.getVariants();
    const childVariants = [];
    variants.map(variant => {
      if (~variant.ancestors.indexOf(_id) && variant.type !== "inventory") {
        childVariants.push(variant);
      }
    });
    return childVariants;
  },
  hasChildVariants: function () {
    return ReactionProduct.checkChildVariants(this._id) > 0;
  },
  hasInventoryVariants: function () {
    if (!hasChildVariants()) {
      return ReactionProduct.checkInventoryVariants(this._id) > 0;
    }
  },
  nowDate: function () {
    return new Date();
  },
  variantFormId: function () {
    return "variant-form-" + this._id;
  },
  variantFormVisible: function () {
    if (!Session.equals("variant-form-" + this._id, true)) {
      return "hidden";
    }
  },
  displayInventoryManagement: function () {
    if (this.inventoryManagement !== true) {
      return "display:none;";
    }
  },
  displayLowInventoryWarning: function () {
    if (this.inventoryManagement !== true) {
      return "display:none;";
    }
  }
});

/**
 * variantForm events
 */

Template.variantForm.events({
  "change form :input": function (event, template) {
    let formId;
    formId = "#variant-form-" + template.data._id;
    template.$(formId).submit();
    ReactionProduct.setCurrentVariant(template.data._id);
  },
  "click .btn-child-variant-form": function (event, template) {
    let productId;
    event.stopPropagation();
    event.preventDefault();
    productId = ReactionProduct.selectedProductId();
    if (!productId) {
      return;
    }
    Meteor.call("products/createVariant", template.data._id);
  },
  "click .btn-remove-variant": function () {
    let title = this.title || "this variant";
    if (confirm("Are you sure you want to delete " + title)) {
      let id = this._id;
      Meteor.call("products/deleteVariant", id, function (error, result) {
        if (result && ReactionProduct.selectedVariantId() === id) {
          return ReactionProduct.setCurrentVariant(null);
        }
      });
    }
  },
  "click .btn-clone-variant": function (event, template) {
    let productId;
    event.stopPropagation();
    event.preventDefault();
    productId = ReactionProduct.selectedProductId();
    if (!productId) {
      return;
    }
    Meteor.call("products/cloneVariant", productId, template.data._id,
      function (error, result) {
        return toggleSession("variant-form-" + result);
      });
  }
});
