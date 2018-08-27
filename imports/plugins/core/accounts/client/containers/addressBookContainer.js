import { compose, withProps } from "recompose";
import { registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { i18next, Logger, Reaction } from "/client/api";
import { Countries } from "/client/collections";
import * as Collections from "/lib/collections";
import getCart from "/imports/plugins/core/cart/client/util/getCart";
import AddressBook from "../components/addressBook";

/**
 * @private
 * @param {Object} address - address to be validated.
 * @returns {Promise} Promise
 */
function callValidateAddress(address) {
  return new Promise((resolve, reject) => {
    Meteor.call("accounts/validateAddress", address, (error, result) => {
      if (error || !result) {
        let errorMessage = (error && error.message) || "Validation Failed";
        if (error && error.error === "validation-error" && Array.isArray(error.details) && error.details.length) {
          Logger.error(error);
          // Add details of first invalid field from SimpleSchema
          errorMessage = error.details[0].message;
        }
        reject(i18next.t("addressBookEdit.somethingWentWrong", { err: errorMessage }));
      } else if (result.validated === false && !result.suggestedAddress) {
        reject(i18next.t("addressBookEdit.somethingWentWrong", { err: "Unable to fetch corrected address" }));
      } else if (result.validated === false && result.suggestedAddress && result.formErrors && result.formErrors.length > 0) {
        reject(i18next.t("addressBookEdit.somethingWentWrong", { err: result.formErrors[result.formErrors.length - 1].details }));
      } else {
        resolve(result);
      }
    });
  });
}

/**
 * @private
 * @param {Object} address - address to be added
 * @returns {undefined}
 */
function callAddAddress(address) {
  return new Promise((resolve, reject) => {
    const { cart } = getCart();
    Meteor.call("accounts/addressBookAdd", address, null, cart && cart._id, (err, addedAddress) => {
      if (err || !addedAddress) {
        err && Logger.error(err);
        reject(i18next.t("addressBookAdd.failedToAddAddress", { err: err && err.message }));
      } else {
        resolve(addedAddress);
      }
    });
  });
}

/**
 * @private
 * @param {Object} address - address to be added
 * @returns {undefined}
 */
function callSetShipmentAddress(address) {
  return new Promise((resolve, reject) => {
    const { cart, token } = getCart();
    if (!cart) {
      resolve(address);
      return;
    }

    Meteor.call("cart/setShipmentAddress", cart._id, token, address, (err, res) => {
      if (err || !res) {
        err && Logger.error(err);
        reject(i18next.t("addressBookEdit.somethingWentWrong", { err: err && err.message }));
      } else {
        resolve(address);
      }
    });
  });
}

/**
 * @private
 * @param {Object} address - address to be added
 * @returns {undefined}
 */
function callSetPaymentAddress(address) {
  return new Promise((resolve, reject) => {
    const { cart, token } = getCart();
    if (!cart) {
      resolve(address);
      return;
    }

    Meteor.call("cart/setPaymentAddress", cart._id, token, address, (err, res) => {
      if (err || !res) {
        err && Logger.error(err);
        reject(i18next.t("addressBookEdit.somethingWentWrong", { err: err && err.message }));
      } else {
        resolve(address);
      }
    });
  });
}

/**
 * @private
 * @param {Object} address - address to be updated.
 * @param {String} property - property to be updated.
 * @returns {undefined}
 */
function callUpdateAddress(address, property) {
  return new Promise((resolve, reject) => {
    Meteor.call("accounts/addressBookUpdate", address, null, property, (err, updatedAddress) => {
      if (err || !updatedAddress) {
        err && Logger.error(err);
        reject(i18next.t("addressBookEdit.somethingWentWrong", { err: err && err.message }));
      } else {
        resolve(updatedAddress);
      }
    });
  });
}

/**
 * @private
 * @param {String} addressId - ID of address to remove from cart
 * @param {String} type - "billing" or "shipping"
 * @returns {Promise<Object>} Result
 */
function callUnsetAddress(addressId, type) {
  return new Promise((resolve, reject) => {
    const { cart, token } = getCart();
    if (!cart) {
      resolve();
      return;
    }

    Meteor.call("cart/unsetAddresses", cart && cart._id, token, addressId, type, (err, res) => {
      if (err || !res) {
        err && Logger.error(err);
        reject(i18next.t("addressBookEdit.somethingWentWrong", { err: err && err.message }));
      } else {
        resolve();
      }
    });
  });
}

/**
 * @summary Update shipping or billing address for cart
 * @param {Object} updatedAddress Address
 * @returns {Promise<Boolean[]>} Resolves with 0 or more results
 */
function updateCartAddresses(updatedAddress) {
  const promises = [];

  if (updatedAddress) {
    if (updatedAddress.isShippingDefault) {
      promises.push(callSetShipmentAddress(updatedAddress));
    } else {
      promises.push(callUnsetAddress(updatedAddress._id, "shipping"));
    }

    if (updatedAddress.isBillingDefault) {
      promises.push(callSetPaymentAddress(updatedAddress));
    } else {
      promises.push(callUnsetAddress(updatedAddress._id, "billing"));
    }
  }

  return Promise.all(promises);
}

const handlers = {
  /**
   * @name updateAddress
   * @method
   * @memberof Helpers
   * @summary helper function that validates and updates an address in the account's addressBook via a meteor method.
   * @since 2.0.0
   * @param {Object} address - address to be updated.
   * @param {String} property - property to be updated.
   * @param {Boolean} [validateAddress] - Should validate first? Default is true
   * @return {Promise} Promise
   */
  updateAddress(address, property, validateAddress = true) {
    if (validateAddress) {
      return callValidateAddress(address)
        .then((result) => {
          if (result.validated) {
            return callUpdateAddress(address, property);
          }
          return null;
        })
        .then(updateCartAddresses);
    }

    return callUpdateAddress(address, property).then(updateCartAddresses);
  },

  /**
   * @name removeAddress
   * @method
   * @memberof Helpers
   * @summary helper function that updates an address in the account's addressBook via a meteor method.
   * @since 2.0.0
   * @param {String} _id - _id of address to be removed.
   * @return {Promise} Promise
   */
  removeAddress(_id) {
    return new Promise((resolve, reject) => {
      Meteor.call("accounts/addressBookRemove", _id, (error, result) => {
        if (error || !result) {
          reject(i18next.t("addressBookGrid.cantRemoveThisAddress", { err: error.message }));
        } else {
          resolve(result);
        }
      });
    });
  },

  /**
   * @name addAddress
   * @method
   * @memberof Helpers
   * @summary helper function that validates and adds an address in the account's addressBook via a meteor method.
   * @since 2.0.0
   * @param {Object} address - address to be added.
   * @param {Boolean} [validateAddress] - Should validate first? Default is true
   * @return {Promise} Promise
   */
  addAddress(address, validateAddress = true) {
    if (validateAddress) {
      return callValidateAddress(address)
        .then((result) => {
          if (result.validated) {
            return callAddAddress(address);
          }
          return result;
        })
        .then(updateCartAddresses);
    }

    return callAddAddress(address).then(updateCartAddresses);
  },

  markCart(address, isEnteredSelected) {
    if (!isEnteredSelected) {
      Meteor.call("accounts/markAddressValidationBypassed", false, (error) => {
        if (error) {
          return Logger.error(error, "Unable to mark the cart");
        }
        Meteor.call("accounts/markTaxCalculationFailed", false, (err) => {
          if (err) {
            return Logger.error(err, "Unable to mark the cart");
          }
        });
      });
    } else {
      Meteor.call("accounts/markAddressValidationBypassed", true, (error) => {
        if (error) {
          return Logger.error(error, "Unable to mark the cart");
        }
      });
    }
  },

  /**
   * @name onError
   * @method
   * @memberof Helpers
   * @summary helper function that shows an error message in an alert toast.
   * @since 2.0.0
   * @param {Object} errorMessage - error message object.
   * @returns {undefined}
   */
  onError(errorMessage) {
    Alerts.toast(errorMessage, "error");
  }
};

/**
 * @private
 * @param {Object} props Props
 * @param {Function} onData Call this to update props
 * @returns {undefined}
 */
function composer(props, onData) {
  const userId = Reaction.getUserId();
  const account = Collections.Accounts.findOne({ userId });
  if (!account) {
    // Subscription not ready
    return;
  }

  const { addressBook } = account.profile;
  const countries = Countries.find().fetch();
  const shop = Collections.Shops.findOne();
  const shopCountries = shop.locales.countries;

  const regionsByCountry = {};
  Object.keys(shopCountries).forEach((key) => {
    const { states } = shopCountries[key] || {};
    const regions = [];
    if (states) {
      // states is an object that needs to be converted
      // to an array of region labels and values
      Object.keys(states).forEach((index) => {
        regions.push({
          label: states[index].name,
          value: index
        });
      });
    }
    regionsByCountry[key] = regions;
  });

  // The initial mode for addressBook
  // If we have passed the address step, show the grid
  let initMode;
  const { cart } = getCart();
  if (!cart || !cart.workflow || cart.workflow.status !== "checkoutAddressBook") {
    initMode = "grid";
  }

  // AddressBook heading will be different in different views
  // If the view template that's using the AddressBook has a
  // heading object, set it as the AddressBook heading
  if (!this.heading) {
    const template = Template.instance();
    const { data } = template || { data: undefined };
    const { heading: templateHeading } = data || { heading: undefined };
    if (templateHeading) {
      this.heading = templateHeading;
    } else {
      this.heading = {
        defaultValue: "Address Book",
        i18nKey: "accountsUI.addressBook"
      };
    }
  }

  onData(null, {
    addressBook,
    countries,
    heading: this.heading,
    initMode,
    regionsByCountry
  });
}

registerComponent("AddressBook", AddressBook, [
  composeWithTracker(composer),
  withProps(handlers)
]);

export default compose(
  composeWithTracker(composer),
  withProps(handlers)
)(AddressBook);
