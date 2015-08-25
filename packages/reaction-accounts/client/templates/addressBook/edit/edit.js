
/*
 * update address book (cart) form handling
 * onSubmit we need to add accountId which is not in context
 */

AutoForm.hooks({
  addressBookEditForm: {
    onSubmit: function(insertDoc, updateDoc, currentDoc) {

      this.event.preventDefault();

      var addressBook = $(this.template.firstNode).closest('.address-book');
      var accountId = ReactionCore.Collections.Accounts.findOne()._id;
      var error;

      try {
        Meteor.call("addressBookUpdate", insertDoc, accountId, function(error, result) {
          var cart, ref, ref1, ref2, ref3;
          if (result) {

            // TODO: Maybe only do this when inside the cart
            cart = ReactionCore.Collections.Cart.findOne();

            if (cart !== null) {

              if (cart.shipping !== null) {
                if (cart.shipping.address !== null) {
                  cart.shipping._id = insertDoc.id;

                  Meteor.call("addressBookAdd", insertDoc, accountId);
                }


              }

              if (cart.billing !== null) {
                if (cart.billing.address !== null) {
                  cart.billing._id = insertDoc._id
                  Meteor.call("addressBookAdd", insertDoc, accountId);
                }
              }
            }

          }
        });
      } catch (_error) {
        error = _error;
        this.done(new Error(error));
        return false;
      }
      this.done();

      // Show the grid
      addressBook.trigger($.Event('showMainView'));

    }
  }
});
