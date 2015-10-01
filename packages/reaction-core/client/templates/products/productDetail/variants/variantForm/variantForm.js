/**
* variantForm helpers
*/

Template.variantForm.helpers({
  variantDetails: function() {
    if (this.parentId == null) {
      return Template.parentVariantForm;
    } else {
      return Template.childVariantForm;
    }
  },
  childVariants: function() {
    var product, variant;
    product = selectedProduct();
    if (!product) {
      return;
    }
    return (function() {
      var _i, _len, _ref, _results;
      _ref = product.variants;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        variant = _ref[_i];
        if ((variant != null ? variant.parentId : void 0) === this._id && variant.type !== 'inventory') {
          _results.push(variant);
        }
      }
      return _results;
    }).call(this);
  },
  hasChildVariants: function() {
    if (checkChildVariants(this._id) > 0) {
      return true;
    }
  },
  hasInventoryVariants: function() {
    if (!hasChildVariants()) {
      if (checkInventoryVariants(this._id) > 0) {
        return true;
      }
    }
  },
  nowDate: function() {
    return new Date();
  },
  variantFormId: function() {
    return "variant-form-" + this._id;
  },
  variantFormVisible: function() {
    if (!Session.equals("variant-form-" + this._id, true)) {
      return "hidden";
    }
  },
  displayInventoryManagement: function() {
    if (this.inventoryManagement !== true) {
      return "display:none;";
    }
  },
  displayLowInventoryWarning: function() {
    if (this.inventoryManagement !== true) {
      return "display:none;";
    }
  }
});

/**
* variantForm events
*/

Template.variantForm.events({
  "change form :input": function(event, template) {
    var formId;
    formId = "#variant-form-" + template.data._id;
    template.$(formId).submit();
    setCurrentVariant(template.data._id);
  },
  "click .btn-child-variant-form": function(event, template) {
    var productId;
    event.stopPropagation();
    event.preventDefault();
    productId = selectedProductId();
    if (!productId) {
      return;
    }
    Meteor.call("products/cloneVariant", productId, template.data._id, this._id);
  },
  "click .btn-remove-variant": function(event, template) {
    var id, title;
    title = this.title || "this variant";
    if (confirm("Are you sure you want to delete " + title)) {
      id = this._id;
      Meteor.call("products/deleteVariant", id, function(error, result) {
        if (result && selectedVariantId() === id) {
          return setCurrentVariant(null);
        }
      });
    }
  },
  "click .btn-clone-variant": function(event, template) {
    var productId;
    event.stopPropagation();
    event.preventDefault();
    productId = selectedProductId();
    if (!productId) {
      return;
    }
    Meteor.call("products/cloneVariant", productId, template.data._id, function(error, result) {
      return toggleSession("variant-form-" + result);
    });
  }
});
