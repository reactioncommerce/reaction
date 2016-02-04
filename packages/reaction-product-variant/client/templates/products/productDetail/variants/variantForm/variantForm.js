/**
 * variantForm helpers
 */

Template.variantForm.helpers({
  variantDetails: function () {
    if (this.parentId === null) {
      return Template.parentVariantForm;
    }
    return Template.childVariantForm;
  },
  childVariants: function () {
    let product = ReactionProduct.selectedProduct();
    if (!product) {
      return {};
    }
    let _results = [];
    for (let variant of product.variants) {
      if ((typeof variant === "object" ? variant.parentId : void 0) === this._id &&
        variant.type !== "inventory") {
        _results.push(variant);
      }
    }
    return _results;
  },
  hasChildVariants: function () {
    if (ReactionProduct.checkChildVariants(this._id) > 0) {
      return true;
    }
  },
  hasInventoryVariants: function () {
    if (!hasChildVariants()) {
      if (ReactionProduct.checkInventoryVariants(this._id) > 0) {
        return true;
      }
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
    Meteor.call("products/cloneVariant", productId, template.data._id,
      this._id);
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
