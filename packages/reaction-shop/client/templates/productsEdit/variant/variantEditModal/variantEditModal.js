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
    var isValid = $(template.find('form')).parsley('validate');
    if (isValid) {
      $(template.find('.variant-edit-modal')).modal('hide');
    }
    e.preventDefault();
    e.stopPropagation();
  }
});
