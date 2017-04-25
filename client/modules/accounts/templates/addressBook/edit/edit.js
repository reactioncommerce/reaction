import { $ } from "meteor/jquery";
import { i18next } from "/client/api";
import { Meteor } from "meteor/meteor";
import { Session } from "meteor/session";
import { setValidatedAddress } from "../add/add";


function setWorkingAddress(address) {
  if (address.fullName) {
    const fullName = $("input[name='fullName']");
    fullName.val(address.fullName);
  }
  if (address.city) {
    const city = $("input[name='city']");
    city.val(address.city);
  }
  if (address.postal) {
    const postal = $("input[name='postal']");
    postal.val(address.postal);
  }
  if (address.address1) {
    const address1 = $("input[name='address1']");
    address1.val(address.address1);
  }

  if (address.address2) {
    const address2 = $("input[name='address2']");
    address2.val(address.address2);
  }
  if (address.country) {
    const country = $("select[name='country']");
    country.val(address.country);
  }

  if (address.region) {
    const region = $("select[name='region']");
    region.val(address.region);
  }

  if (address.phone) {
    const phone = $("input[name='phone']");
    phone.val(address.phone);
  }

  if (address.isCommercial) {
    const isCommercial = $("input[name='isCommercial']");
    isCommercial.val(address.isCommercial);
  }
}


Template.addressBookEdit.onRendered(function () {
  const addressState = Session.get("addressState");
  if (addressState.address) {
    setWorkingAddress(addressState.address);
  }
});

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
        // if the address is validated OR the address has already been through the validation process, pass it on
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
