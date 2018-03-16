import React, { Component } from "react";
import PropTypes from "prop-types";
import { compose } from "recompose";
import { Meteor } from "meteor/meteor";
import { i18next } from "/client/api";
import * as Collections from "/lib/collections";
import { registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import AddressBook from "../components/addressBook";

/**
 * @method updateAddress
 * @summary helper function that updates an address in the account's addressBook via a meteor method.
 * @since 2.0.0
 * @param {Object} address - address to be updated.
 * @param{String} property - property to be updated.
 */
function updateAddress(address, property) {
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
      // return false;
    }
    if (result) {
      // return true;
    }
    // return false;
  });
}

/**
 * @method addAddress
 * @summary helper function that adds an address in the account's addressBook via a meteor method.
 * @since 2.0.0
 * @param {Object} address - address to be added.
 */
function addAddress(address) {
  Meteor.call("accounts/validateAddress", address, (error, result) => {
    if (result.validated) {
      Meteor.call("accounts/addressBookAdd", address, (err, res) => {
        if (err) {
          Alerts.toast(i18next.t("addressBookAdd.failedToAddAddress", { err: err.message }), "error");
          // return false;
        }
        if (res) {
          // return true;
        }
        // return false;
      });
    }
    // return false;
  });
}

const wrapComponent = (Comp) => (
  class AddressBookContainer extends Component {
    static propTypes = {
      addressBook: PropTypes.array, // array of address objects
      heading: PropTypes.object // heading content { defaultValue: String, i18nKey: String, checkout: Object }
    }

    addAddress = (address) => addAddress(address);

    updateAddress = (address, property) => updateAddress(address, property);

    removeAddress = (_id) => removeAddress(_id);

    render() {
      return (
        <Comp
          {...this.props}
          addAddress={this.addAddress}
          updateAddress={this.updateAddress}
          removeAddress={this.removeAddress}
        />
      );
    }
  }
);

function composer(props, onData) {
  const account = Collections.Accounts.findOne({ _id: Meteor.userId() });

  const heading = {
    defaultValue: "Title",
    i18nKey: "key",
    checkout: {
      icon: "active",
      position: 2
    }
  };

  const { addressBook } = account.profile;

  onData(null, {
    addressBook,
    heading
  });
}

registerComponent("AddressBookContainer", AddressBook, [
  composeWithTracker(composer),
  wrapComponent
]);

export default compose(
  composeWithTracker(composer),
  wrapComponent
)(AddressBook);
