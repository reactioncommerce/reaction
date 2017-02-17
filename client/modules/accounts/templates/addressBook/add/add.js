import { i18next } from "/client/api";
import * as Collections from "/lib/collections";
import { Session } from "meteor/session";
import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";

Template.addressBookAdd.helpers({
  thisAddress: function () {
    const thisAddress = {};
    // admin should receive his account
    const account = Collections.Accounts.findOne({
      userId: Meteor.userId()
    });
    if (account) {
      if (account.profile) {
        if (account.profile.name) {
          thisAddress.fullName = account.profile.name;
        }
        // if this will be the first address we set defaults here and not display
        // them inside form
        if (account.profile.addressBook) {
          if (account.profile.addressBook.length === 0) {
            thisAddress.isShippingDefault = true;
            thisAddress.isBillingDefault = true;
          }
        }
      }
    }

    if (Session.get("address")) {
      thisAddress.postal = Session.get("address").zipcode;
      thisAddress.country = Session.get("address").countryCode;
      thisAddress.city = Session.get("address").city;
      thisAddress.region = Session.get("address").state;
    }

    return thisAddress;
  },

  hasAddressBookEntries: function () {
    const account = Collections.Accounts.findOne({
      userId: Meteor.userId()
    });
    if (account) {
      if (account.profile) {
        if (account.profile.addressBook) {
          return account.profile.addressBook.length > 0;
        }
      }
    }

    return false;
  }
});


export function setValidatedAddress(res) {
  if (res.validatedAddress.city) {
    const city = $("input[name='city']");
    city.val(res.validatedAddress.city);
  }
  if (res.validatedAddress.postal) {
    const postal = $("input[name='postal']");
    postal.val(res.validatedAddress.postal);
  }
  if (res.validatedAddress.address1) {
    const address1 = $("input[name='address1']");
    address1.val(res.validatedAddress.address1);
  }

  if (res.validatedAddress.address2) {
    const address2 = $("input[name='address2']");
    address2.val(res.validatedAddress.address2);
  }
  if (res.validatedAddress.country) {
    const country = $("select[name='country']");
    country.val(res.validatedAddress.country);
  }

  if (res.validatedAddress.region) {
    const region = $("select[name='region']");
    region.val(res.validatedAddress.region);
  }
}

/**
 * addressBookAddForm form handling
 * @description gets accountId and calls addressBookAdd method
 * @fires "accounts/addressBookAdd" method
 */
AutoForm.hooks({
  addressBookAddForm: {
    onSubmit: function (insertDoc) {
      const that = this;
      this.event.preventDefault();
      const addressBook = $(this.template.firstNode).closest(".address-book");

      Meteor.call("accounts/validateAddress", insertDoc, function (err, res) {
        if (res.validated) {
          Meteor.call("accounts/addressBookAdd", insertDoc, function (error, result) {
            if (error) {
              Alerts.toast(i18next.t("addressBookAdd.failedToAddAddress", { err: error.message }), "error");
              that.done(new Error("Failed to add address: ", error));
              return false;
            }
            if (result) {
              that.done();
              addressBook.trigger($.Event("showMainView"));
              return true;
            }
          });
        } else {
          if (res.validatedAddress) {
            setValidatedAddress(res);
            Alerts.inline("Made changes to your address based upon validation. Please ensure this is correct", "warning", {
              placement: "addressBookAdd",
              i18nKey: "addressBookAdd.validatedAddress"
            });
          }
          if (res.formErrors) {
            for (const error of res.formErrors) {
              Alerts.inline(error.details, "error", {
                placement: "addressBookAdd"
              });
            }
          }
          that.done("Validation failed"); // renable Save and Continue button
        }
      });
    }
  }
});
