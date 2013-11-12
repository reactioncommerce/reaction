Template.variantEditModal.variant = function() {
  var currentProduct = Products.findOne(Session.get('currentProductId'));
  return currentProduct.variants[Session.get('currentVariantIndex')];
};

Template.variantEditModal.events({
  'click .close-button': function(e, template) {
//    template.find('form').reset();
  },
  'click .save-button': function(e, template) {
    // TODO: check for compliance with Shopify API
    // TODO: notably, inventory_policy should be "deny" if checkbox isn't selected
    // TODO: Make quantity "required" a dynamic attribute
    // TODO: convert data to proper types
    // TODO: Simplify the true : false; in helper
    var $form = $(template.find('form'));
    var currentProduct = Products.findOne(Session.get('currentProductId'));
    var variant = currentProduct.variants[Session.get('currentVariantIndex')];
    // TODO: Normalize checkboxes... should be done by a library
    data = {
      inventoryPolicy: "deny",
      taxable: false,
      requiresShipping: false
    };
    $.each($form.serializeArray(), function() {
      data[this.name] = this.value;
    });
    $.extend(true, variant, data);
    var $set = {};
    $set["variants."+Session.get('currentVariantIndex')] = variant;
    Products.update(currentProduct._id, {$set: $set});
    $('#variant-edit-modal').modal('hide'); // manual hide fix for Meteor reactivity
  }
});
