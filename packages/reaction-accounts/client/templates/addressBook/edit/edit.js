
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
          // TODO: On error show message, maybe?
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
