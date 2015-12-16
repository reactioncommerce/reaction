
/*
 * update address book (cart) form handling
 * onSubmit we need to add accountId which is not in context
 */

AutoForm.hooks({
  addressBookEditForm: {
    onSubmit: function (insertDoc, updateDoc, currentDoc) {

      this.event.preventDefault();

      const addressBook = $(this.template.firstNode).closest(".address-book");
      // TODO: when this template will be transform into component, `accountId`
      // should be `props`.
      // TODO: if we will add the ability to edit the address through the
      // dashboard, the field needs to be changed
      const accountId = Meteor.userId();

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
