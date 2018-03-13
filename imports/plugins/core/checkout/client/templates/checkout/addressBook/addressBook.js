import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { i18next } from "/client/api";
import * as Collections from "/lib/collections";
import { Components } from "@reactioncommerce/reaction-components";

let entryMode = false;

const getAccount = () => Collections.Accounts.findOne({ _id: Meteor.userId() });

function updateAddress(address, property) {
  Meteor.call("accounts/addressBookUpdate", address, null, property);
}

function removeAddress(_id) {
  Meteor.call("accounts/addressBookRemove", _id, (error, result) => {
    if (error) {
      Alerts.toast(i18next.t("addressBookGrid.cantRemoveThisAddress", { err: error.message }), "error");
    }
    if (result) {
      console.log("address removed!");
    }
  });
}


/**
 * Helpers: Checkout Address Book
 */
Template.checkoutAddressBook.helpers({
  /**
   * @method AddressBook
   * @summary returns a component for updating a user's address.
   * @since 2.0.0
   * @return {Object} - contains the component for updating a user's address.
   */
  AddressBook() {
    const { status, position } = Template.instance().data;
    const account = getAccount();
    const { addressBook } = account.profile;

    return {
      component: Components.AddressBook,
      account,
      addressBook,
      heading: {
        defaultValue: "Choose shipping & billing address",
        i18nKey: "addressBookGrid.chooseAddress",
        checkout: {
          icon: (status === true || status === this.template) ? "active" : "",
          position
        }
      },
      updateAddress,
      removeAddress
    };
  }
});
