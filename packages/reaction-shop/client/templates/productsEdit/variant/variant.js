Template.variant.events = {
//  'change input[name="variant"]': function (e, template) {
//    if (e.target.checked) {
//
//    }
//    return true;
//  },
  'click .remove-link': function (e, template) {
    if (confirm($(e.target).closest('a').data('confirm'))) {
      Products.update(Session.get('currentProductId'), {$pull: {variants: template.data}});
    }
    e.preventDefault();
    e.stopPropagation();
  },
  'click .edit-link': function (e, template) {
//    $('#variants-modal form').get(0).reset();
    Session.set('currentVariantIndex', $(e.target).closest('tr').prevAll().length);
    $('#variants-modal').modal();
    e.preventDefault();
    e.stopPropagation();
  },
  'click .buy': function(e,template) {
    now = new Date();
    var sessionId = Session.get('serverSession')._id;
    var variantData = template.data;
    var productId = Session.get('currentProductId');
    var quantity = 1;
    // Check for, create cart
    Meteor.call('createCart',sessionId,productId,variantData, function(err, cart) {
      if (err)
        console.log(err);
      else      // Insert new item, update quantity for existing
      var currentCart = Cart.findOne();
      Meteor.call('addToCart',currentCart._id,productId,variantData,quantity);
    });

    e.preventDefault();
  }
};
