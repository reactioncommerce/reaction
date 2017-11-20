import { $ } from "meteor/jquery";
import { Session } from "meteor/session";
import { Meteor } from "meteor/meteor";
import { HTTP } from "meteor/http";
import { ReactiveVar } from "meteor/reactive-var";
import { AutoForm } from "meteor/aldeed:autoform";
import { Template } from "meteor/templating";
import { Reaction, i18next } from "/client/api";
import * as Collections from "/lib/collections";

Template.addressBookAdd.onCreated(function () {
  this.currentCountry = new ReactiveVar(null);
  // hit Reaction's GeoIP server and try to determine the user's country
  HTTP.get("https://geo.getreaction.io/json/", (err, res) => {
    if (!err) {
      this.currentCountry.set(res.data.country_code);
    }
  });
});

Template.addressBookAdd.helpers({
  thisAddress() {
    const thisAddress = {};

    // admin should receive their account
    const account = Collections.Accounts.findOne({
      userId: Meteor.userId()
    });

    if (account && account.profile) {
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

    const shop = Reaction.getShop();

    // Set default country code based on shop's shipping address
    if (shop && Array.isArray(shop.addressBook) && shop.addressBook.length > 0) {
      const defaultAddress = shop.addressBook.find(address => address.isShippingDefault);
      const defaultCountryCode = defaultAddress.country;
      if (defaultCountryCode) {
        thisAddress.country = defaultCountryCode;
      }
    }

    if (Session.get("address")) {
      thisAddress.postal = Session.get("address").zipcode;
      thisAddress.country = Session.get("address").countryCode;
      thisAddress.city = Session.get("address").city;
      thisAddress.region = Session.get("address").state;
    }

    // update the reactive country code from the GeoIP lookup (if found)
    thisAddress.country = Template.instance().currentCountry.get() || thisAddress.country;

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
        // if the address is validated OR the address has already been through the validation process, pass it on
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
          // set addressState and kick it back to review
          const addressState = {
            requiresReview: true,
            address: insertDoc,
            validatedAddress: res.validatedAddress,
            formErrors: res.formErrors,
            fieldErrors: res.fieldErrors
          };
          Session.set("addressState", addressState);
          addressBook.trigger($.Event("addressRequiresReview"));
        }
      });
    }
  }
});
