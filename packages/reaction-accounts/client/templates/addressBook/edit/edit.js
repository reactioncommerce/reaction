
Template.addressBookEdit.onCreated(function () {
  console.log('addressBookEdit', this)
})

/*
 * update address book (cart) form handling
 * onSubmit we need to add accountId which is not in context
 */

AutoForm.hooks({
  addressBookEditForm: {
    onSubmit: function(insertDoc, updateDoc, currentDoc) {
      var accountId, error;

      this.event.preventDefault();
      accountId = ReactionCore.Collections.Accounts.findOne()._id;
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

      console.log('return to address grid', this.template)

      var view = $(this.template.firstNode).closest('[blaze-view="addressBook"]');
      view.empty();

      Blaze.render(Template.addressBookGrid, view.get(0));


    }
  }
});
