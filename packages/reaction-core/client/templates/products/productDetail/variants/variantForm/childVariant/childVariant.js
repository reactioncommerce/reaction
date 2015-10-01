/**
* childVariantForm helpers
*/

Template.childVariantForm.helpers({
  childVariantFormId: function() {
    return "child-variant-form-" + this._id;
  },
  hasInventoryVariants: function() {
    if (checkInventoryVariants(this._id) > 0) {
      return true;
    }
  },
  inventoryVariants: function() {
    var product, variant;
    product = selectedProduct();
    if (!product) {
      return;
    }
    return ((function() {
      var _i, _len, _ref, _results;
      _ref = product.variants;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        variant = _ref[_i];
        if ((variant != null ? variant.parentId : void 0) === this._id && variant.type === 'inventory') {
          _results.push(variant);
        }
      }
      return _results;
    }).call(this)).reverse();
  },
  showInventoryVariants: function() {
    if (Session.get("showInventoryVariants" + this._id)) {
      return '';
    } else {
      return 'hidden';
    }
  },
  editInventoryToggleText: function() {
    if (Session.get("showInventoryVariants" + this._id)) {
      return i18n.t("productDetail.hideBarcodes");
    } else {
      return i18n.t("productDetail.showBarcodes");
    }
  }
});

/**
* childVariantForm events
*/

Template.childVariantForm.events({
  "click .child-variant-form :input, click li": function(event, template) {
    return setCurrentVariant(template.data._id);
  },
  "click .edit-inventory-variants": function(event, template) {
    var showInventoryVariantsId;
    showInventoryVariantsId = "showInventoryVariants" + this._id;
    if (!Session.get(showInventoryVariantsId)) {
      return Session.set(showInventoryVariantsId, true);
    } else {
      return Session.set(showInventoryVariantsId, false);
    }
  },
  "click .init-inventory-variants": function(event, template) {
    var productId, showInventoryVariantsId;
    showInventoryVariantsId = "showInventoryVariants" + this._id;
    Session.set(showInventoryVariantsId, true);
    productId = selectedProductId();
    return Meteor.call("products/createInventoryVariants", productId, this._id, this.inventoryQuantity, "default");
  },
  "change .child-variant-form :input": function(event, template) {
    var field, productId, value, variant;
    productId = selectedProductId();
    variant = template.data;
    value = $(event.currentTarget).val();
    field = $(event.currentTarget).attr('name');
    variant[field] = value;
    Meteor.call("products/updateVariant", variant, function(error, result) {
      if (error) {
        throw new Meteor.Error("error updating variant", error);
      }
    });
    return setCurrentVariant(template.data._id);
  },
  "click #remove-child-variant": function(event, template) {
    var id, optionTitle;
    event.stopPropagation();
    event.preventDefault();
    optionTitle = this.optionTitle || "this option";
    if (confirm("Are you sure you want to delete " + optionTitle)) {
      id = this._id;
      return Meteor.call("products/deleteVariant", id, function(error, result) {
        if (result && selectedVariantId() === id) {
          return setCurrentVariant(null);
        }
      });
    }
  }
});
