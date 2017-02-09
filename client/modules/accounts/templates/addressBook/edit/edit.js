import { i18next } from "/client/api";
import { Meteor } from "meteor/meteor";


function setValidatedAddress(res) {
  const city = $("input[name='city']");
  city.val(res.validatedAddress.city);
  const postal = $("input[name='postal']");
  postal.val(res.validatedAddress.postal);
  const address1 = $("input[name='address1']");
  address1.val(res.validatedAddress.address1);
  if (res.validatedAddress.address2) {
    const address2 = $("input[name='address2']");
    address2.val(res.validatedAddress.address2);
  }
  const country = $("select[name='country']");
  country.val(res.validatedAddress.country);
  const region = $("select[name='region']");
  region.val(res.validatedAddress.region);
}

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
          setValidatedAddress(res);
          Alerts.inline("Made changes to your address based upon validation. Please ensure this is correct", "warning", {
            placement: "addressBookAdd",
            i18nKey: "addressBookAdd.validatedAddress"
          });
          that.done(new Error("Validation failed")); // renable Save and Continue button
        }
      });

    }
  }
});
