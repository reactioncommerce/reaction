Template.variantEditModal.variant = function () {
  var currentProduct = Products.findOne(Session.get('currentProductId'));
  return currentProduct.variants[Session.get('currentVariantIndex')];
};

Template.variantEditModal.events({
  'click .close-button': function (e, template) {
    //    template.find('form').reset();
  },
  'click .save-button': function (e, template) {
    var isValid = $(template.find('form')).parsley('validate');
    if (isValid) {
      $(template.find('.variant-edit-modal')).modal('hide');
    }
    e.preventDefault();
    e.stopPropagation();
  }
});
