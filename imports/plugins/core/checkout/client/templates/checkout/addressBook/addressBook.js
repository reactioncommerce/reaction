import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { i18next } from "/client/api";
import * as Collections from "/lib/collections";
import { Components } from "@reactioncommerce/reaction-components";

/**
 * @method getAccount
 * @summary general helper function that returns the current user account
 * @since 2.0.0
 * @return {Object} - user account.
 */
const getAccount = () => Collections.Accounts.findOne({ _id: Meteor.userId() });

/**
 * @method updateAddress
 * @summary helper function that updates an address in the account's addressBook via a meteor method.
 * @since 2.0.0
 * @param {Object} address - address to be updated.
 * @param{String} property - property to be updated.
 */
function updateAddress(address, property) {
  console.log("update address", address)
  if (property) {
    Meteor.call("accounts/addressBookUpdate", address, null, property);
  } else {
    Meteor.call("accounts/addressBookUpdate", address);
  }
}

/**
 * @method removeAddress
 * @summary helper function that updates an address in the account's addressBook via a meteor method.
 * @since 2.0.0
 * @param {String} _id - _id of address to be removed.
 */
function removeAddress(_id) {
  Meteor.call("accounts/addressBookRemove", _id, (error, result) => {
    if (error) {
      Alerts.toast(i18next.t("addressBookGrid.cantRemoveThisAddress", { err: error.message }), "error");
    }
    if (result) {
      // TODO: FIX THIS
      console.log("address removed!");
    }
  });
}

function addAddress(address) {
  Meteor.call("accounts/validateAddress", address, (error, result) => {
    if (result.validated) {
      console.log("address is valid", result);
      Meteor.call("accounts/addressBookAdd", address, (error, result) => {
        if (error) {
          Alerts.toast(i18next.t("addressBookAdd.failedToAddAddress", { err: error.message }), "error");
        }
        if (result) {
          console.log("address added!");
        }
      });
    } else {
      console.log("address validatiion error", error);
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
      addAddress,
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
