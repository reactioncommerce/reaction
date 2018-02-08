import { Session } from "meteor/session";
import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { AutoForm } from "meteor/aldeed:autoform";
import { Countries } from "/client/collections";
import * as Collections from "/lib/collections";

Template.addressBookForm.helpers({

  /*
   * TODO: update for i18n
   */
  countryOptions() {
    return Countries.find().fetch();
  },
  statesForCountry() {
    let locale;
    const shop = Collections.Shops.findOne();
    const selectedCountry = Session.get("addressBookCountry") || AutoForm.getFieldValue("country");
    if (!selectedCountry) {
      return false;
    }
    if ((shop !== null ? shop.locales.countries[selectedCountry].states : undefined) === null) {
      return false;
    }
    const options = [];
    const ref = shop !== null ? shop.locales.countries[selectedCountry].states : undefined;
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
  isBillingDefault() {
    return typeof this.address === "object" ? this.address.isBillingDefault : true;
  },
  isShippingDefault() {
    return typeof this.address === "object" ? this.address.isShippingDefault : true;
  },
  hasAddressBookEntries() {
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
  "change [name='country']"() {
    return Session.set("addressBookCountry", AutoForm.getFieldValue("country"));
  }
});
