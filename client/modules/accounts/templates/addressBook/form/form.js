import { Session } from "meteor/session";
import { Meteor } from "meteor/meteor";
import { Countries } from "/client/collections";
import * as Collections from "/lib/collections";
import { Template } from "meteor/templating";

Template.addressBookForm.helpers({

  /*
   * TODO: update for i18n
   */
  countryOptions: function () {
    return Countries.find().fetch();
  },
  statesForCountry: function () {
    let locale;
    const shop = Collections.Shops.findOne();
    const selectedCountry = Session.get("addressBookCountry") || AutoForm.getFieldValue("country");
    if (!selectedCountry) {
      return false;
    }
    if ((shop !== null ? shop.locales.countries[selectedCountry].states : void 0) === null) {
      return false;
    }
    options = [];
    const ref = shop !== null ? shop.locales.countries[selectedCountry].states : void 0;
    for (const state in ref) {
      if ({}.hasOwnProperty.call(ref, state)) {
        locale = ref[state];
        options.push({
          label: locale.name,
          value: state
        });
      }
    }
    return options;
  },

  /*
   *  Defaults billing/shipping when 1st new address.
   */
  isBillingDefault: function () {
    return typeof this.address === "object" ? this.address.isBillingDefault : true;
  },
  isShippingDefault: function () {
    return typeof this.address === "object" ? this.address.isShippingDefault : true;
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

Template.addressBookForm.events({
  "change [name='country']": function () {
    return Session.set("addressBookCountry", AutoForm.getFieldValue("country"));
  }
});
