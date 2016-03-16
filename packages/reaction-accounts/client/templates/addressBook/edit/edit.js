
/*
 * update address book (cart) form handling
 * onSubmit we need to add accountId which is not in context
 */

AutoForm.hooks({
  addressBookEditForm: {
    onSubmit: function (insertDoc) {
      this.event.preventDefault();

      const addressBook = $(this.template.firstNode).closest(".address-book");
      Meteor.call("accounts/addressBookUpdate", insertDoc, (error, result) => {
        if (error) {
          Alerts.toast(`Something went wrong: ${error.message}`, "error");
          this.done(new Error(error));
          return false;
        }
        if (result) {
          this.done();

          // Show the grid
          addressBook.trigger($.Event("showMainView"));
        }
      });
    }
  }
});
