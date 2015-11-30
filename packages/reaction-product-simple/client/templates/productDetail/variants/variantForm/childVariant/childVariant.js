/**
 * childVariantForm helpers
 */

Template.childVariantForm.helpers({
  childVariantFormId: function () {
    return "child-variant-form-" + this._id;
  },
  hasInventoryVariants: function () {
    if (checkInventoryVariants(this._id) > 0) {
      return true;
    }
  },
  inventoryVariants: function () {
    let product = selectedProduct();
    if (!product) {
      return [];
    }
    let _results = [];
    for (let variant of product.variants) {
      if ((variant !== null ? variant.parentId : void 0) === this._id &&
        variant.type === "inventory") {
        _results.push(variant);
      }
    }
    return _results.reverse();
  },
  showInventoryVariants: function () {
    if (Session.get("showInventoryVariants" + this._id)) {
      return "";
    }
    return "hidden";
  },
  editInventoryToggleText: function () {
    if (Session.get("showInventoryVariants" + this._id)) {
      return i18n.t("productDetail.hideBarcodes");
    }
    return i18n.t("productDetail.showBarcodes");
  }
});

/**
 * childVariantForm events
 */

Template.childVariantForm.events({
  "click .child-variant-form :input, click li": function (event, template) {
    return setCurrentVariant(template.data._id);
  },
  "click .edit-inventory-variants": function () {
    let showInventoryVariantsId = "showInventoryVariants" + this._id;
    if (!Session.get(showInventoryVariantsId)) {
      return Session.set(showInventoryVariantsId, true);
    }
    return Session.set(showInventoryVariantsId, false);
  },
  "click .init-inventory-variants": function () {
    let showInventoryVariantsId = "showInventoryVariants" + this._id;
    Session.set(showInventoryVariantsId, true);
    let productId = selectedProductId();
    return Meteor.call("products/createInventoryVariants", productId,
      this._id, this.inventoryQuantity, "default");
  },
  "change .child-variant-form :input": function (event, template) {
    let variant = template.data;
    let value = $(event.currentTarget).val();
    let field = $(event.currentTarget).attr("name");

    variant[field] = value;
    Meteor.call("products/updateVariant", variant, function (error) {
      if (error) {
        throw new Meteor.Error("error updating variant", error);
      }
    });
    return setCurrentVariant(template.data._id);
  },
  "click #remove-child-variant": function (event) {
    event.stopPropagation();
    event.preventDefault();
    let optionTitle = this.optionTitle || "this option";
    if (confirm("Are you sure you want to delete " + optionTitle)) {
      let id = this._id;
      return Meteor.call("products/deleteVariant", id, function (error,
        result) {
        if (result && selectedVariantId() === id) {
          return setCurrentVariant(null);
        }
      });
    }
  }
});
