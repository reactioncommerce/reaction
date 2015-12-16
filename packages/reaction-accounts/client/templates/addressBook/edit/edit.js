
/*
 * update address book (cart) form handling
 * onSubmit we need to add accountId which is not in context
 */

AutoForm.hooks({
  addressBookEditForm: {
    onSubmit: function (insertDoc, updateDoc, currentDoc) {

      this.event.preventDefault();

      const addressBook = $(this.template.firstNode).closest(".address-book");
      const accountId = ReactionCore.Collections.Accounts.findOne()._id;

      Meteor.call("accounts/addressBookUpdate", insertDoc, accountId,
        (error, result) => {
          if (error) {
            Alerts.add("Something goes wrong: " + error.message,
              "danger", {
                autoHide: true
              });
            this.done(new Error(error));
            return false;
          }
          if (result) {
            this.done();

            // Show the grid
            addressBook.trigger($.Event("showMainView"));
          }
        }
      );
    }
  }
});
