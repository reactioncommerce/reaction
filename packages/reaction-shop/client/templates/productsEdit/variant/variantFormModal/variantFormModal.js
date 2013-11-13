Template.variantFormModal.variant = function() {
  var currentProduct = Products.findOne(Session.get("currentProductId"));
  return currentProduct.variants[Session.get("currentVariantIndex")];
};

Template.variantFormModal.rendered = function() {
  updateInventoryManagementFieldsVisibility();
};

Template.variantFormModal.events({
  "change #variant-inventoryManagement": function() {
    updateInventoryManagementFieldsVisibility()
  },
  "click .close-button": function(e, template) {
//    template.find("form").reset();
  },
  "click .save-button": function(e, template) {
    // TODO: check for compliance with Shopify API
    // TODO: notably, inventory_policy should be "deny" if checkbox isn"t selected
    // TODO: Make quantity "required" a dynamic attribute
    // TODO: convert data to proper types
    // TODO: Simplify the true : false; in helper
    var form = template.find("form");
    var $form = $(form);
    // TODO: Normalize checkboxes... should be done by a library
    data = {
      inventoryPolicy: "deny",
      taxable: false,
      requiresShipping: false
    };
    $.each($form.serializeArray(), function() {
      data[this.name] = this.value;
    });
    var currentProduct = Products.findOne(Session.get("currentProductId"));
    if (_.isNumber(Session.get("currentVariantIndex"))) {
      var variant = currentProduct.variants[Session.get("currentVariantIndex")];
      $.extend(true, variant, data);
      var $set = {};
      $set["variants."+Session.get("currentVariantIndex")] = variant;
      Products.update(currentProduct._id, {$set: $set});
    } else {
      Products.update(currentProduct._id, {$push: {variants: data}});
    }
    form.reset();
    $("#variant-edit-modal").modal("hide"); // manual hide fix for Meteor reactivity
  }
});

var updateInventoryManagementFieldsVisibility = function() {
  var $select = $("#variant-inventoryManagement");
  $('#variant-inventoryQuantity, #variant-inventoryPolicy').closest('.form-group').toggle($select.val() == "reaction");
};
