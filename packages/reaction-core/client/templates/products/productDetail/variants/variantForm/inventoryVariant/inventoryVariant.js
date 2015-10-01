/**
 * inventoryVariantForm helpers
 */

Template.inventoryVariantForm.helpers({
  inventoryVariantFormId: function () {
    return "inventory-variant-form-" + this._id;
  },
  removeInventoryVariantId: function () {
    return "remove-inventory-variant-" + this._id;
  }
});

/**
 * inventoryVariantForm events
 */

Template.inventoryVariantForm.events({
  "click .inventory-variant-form :input, click li": function (event, template) {
    return setCurrentVariant(template.data._id);
  },
  "change .inventory-variant-form :input": function (event, template) {
    var field, productId, value, variant;
    productId = selectedProductId();
    variant = template.data;
    value = $(event.currentTarget).val();
    field = $(event.currentTarget).attr('name');
    variant[field] = value;
    Meteor.call("products/updateVariant", variant, function (error, result) {
      if (error) {
        throw new Meteor.Error("error updating variant", error);
      }
    });
    return setCurrentVariant(template.data._id);
  },
  "click .remove-inventory-variant": function (event, template) {
    var barcode, id;
    event.stopPropagation();
    event.preventDefault();
    barcode = this.barcode || "barcode not found";
    if (confirm(i18n.t("productDetail.confirmDeleteBarcode") + ": " + barcode)) {
      id = this._id;
      return Meteor.call("products/deleteVariant", id, function (error, result) {
        if (result && selectedVariantId() === id) {
          return setCurrentVariant(null);
        }
      });
    }
  }
});

/**
 * generateInventoryVariantForm events
 */

Template.generateInventoryVariantForm.events({
  "submit .generate-inventory-variants-form": function (event, template) {
    var productId, qty;
    event.stopPropagation();
    event.preventDefault();
    productId = selectedProductId();
    qty = event.target.generateqty.value;
    if (qty && parseInt(qty) > 0) {
      Meteor.call("products/createInventoryVariants", productId, this._id, qty);
      event.target.generateqty.value = "";
    } else {
      Alerts.add(i18n.t('productDetail.quantityGreaterThanZero'), 'danger', {
        placement: 'generateBarcodes'
      });
    }
    return false;
  }
});

/**
 * addInventoryVariantForm events
 */

Template.addInventoryVariantForm.events({
  "submit .add-inventory-variant-form": function (event, template) {
    var barcode, productId;
    event.stopPropagation();
    event.preventDefault();
    productId = selectedProductId();
    barcode = event.target.barcode.value;
    Meteor.call("products/createInventoryVariant", productId, this._id, {
      barcode: barcode
    });
    event.target.barcode.value = "";
    return false;
  }
});
