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

Template.addressBookAdd.events({
  // "click #cancel-new, form submit": function(event, template) {
  //   console.log(event, template, Template.instance())
  //   return Session.set("addressBookView", "addressBookGrid");
  // },
  // "submit form": function() {
  //   return Session.set("addressBookView", "addressBookGrid");
  // }
});

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
        console.log("validateAddress error", err);
        console.log("validatedAddress result", res);
        if (res.validated) {
          Meteor.call("accounts/addressBookAdd", insertDoc, function (error, result) {
            if (error) {
              Alerts.toast(i18next.t("addressBookAdd.failedToAddAddress", { err: error.message }), "error");
              this.done(new Error("Failed to add address: ", error));
              return false;
            }
            if (result) {
              that.done();
              addressBook.trigger($.Event("showMainView"));
              return true;
            }
          });
        } else {
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
          const country = $("input[name='country']");
          country.val(res.validatedAddress.country);
          Alerts.toast(i18next.t("addressBookAdd.validatedAddress", "warning"));
          that.done();
          return true;
        }
      });
    }
  }
});
