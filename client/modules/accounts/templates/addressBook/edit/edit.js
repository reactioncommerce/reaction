import { i18next } from "/client/api";
import { Meteor } from "meteor/meteor";
import { setValidatedAddress } from "../add/add";

/*
 * update address book (cart) form handling
 * onSubmit we need to add accountId which is not in context
 */

AutoForm.hooks({
  addressBookEditForm: {
    onSubmit: function (insertDoc) {
      const that = this;
      this.event.preventDefault();
      const addressBook = $(this.template.firstNode).closest(".address-book");

      Meteor.call("accounts/validateAddress", insertDoc, function (err, res) {
        if (res.validated) {
          Meteor.call("accounts/addressBookUpdate", insertDoc, (error, result) => {
            if (error) {
              Alerts.toast(i18next.t("addressBookEdit.somethingWentWrong", { err: error.message }), "error");
              this.done(new Error(error));
              return false;
            }
            if (result) {
              that.done();

              // Show the grid
              addressBook.trigger($.Event("showMainView"));
            }
          });
        } else {
          if (res.validatedAddress) {
            setValidatedAddress(res);
            Alerts.inline("Made changes to your address based upon validation. Please ensure this is correct", "warning", {
              placement: "addressBookEdit",
              i18nKey: "addressBookAdd.validatedAddress"
            });
          }
          if (res.formErrors) {
            for (const error of res.formErrors) {
              Alerts.inline(error.details, "error", {
                placement: "addressBookEdit"
              });
            }
          }
          that.done("Validation failed"); // renable Save and Continue button
        }
      });
    }
  }
});
