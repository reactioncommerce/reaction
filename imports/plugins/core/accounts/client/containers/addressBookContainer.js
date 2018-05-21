import { compose, withProps } from "recompose";
import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { i18next, Logger } from "/client/api";
import { Countries } from "/client/collections";
import * as Collections from "/lib/collections";
import { registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import AddressBook from "../components/addressBook";


const handlers = {
  /**
   * @name updateAddress
   * @method
   * @memberof Helpers
   * @summary helper function that validates and updates an address in the account's addressBook via a meteor method.
   * @since 2.0.0
   * @param {Object} address - address to be updated.
   * @param{String} property - property to be updated.
   * @return {Promise}
   */
  updateAddress(address, property, validateAddress = true) {
    return new Promise((resolve, reject) => {
      if (validateAddress) {
        Meteor.call("accounts/validateAddress", address, (error, result) => {
          if (error || !result) {
            let errorMessage = (error && error.message) || "Validation Failed";
            if (error && error.error === "validation-error" && Array.isArray(error.details) && error.details.length) {
              // Add details of first invalid field from SimpleSchema
              errorMessage = error.details[0].message;
            }
            reject(i18next.t("addressBookAdd.failedToUpdateAddress", { err: errorMessage }));
            return;
          } else if (result.validated === false && !result.suggestedAddress) {
            reject(i18next.t("addressBookAdd.failedToUpdateAddress", { err: "Unable to fetch corrected address" }));
            return;
          } else if (result.validated === false && result.suggestedAddress && result.formErrors && result.formErrors.length > 0) {
            reject(i18next.t("addressBookAdd.failedToUpdateAddress", { err: result.formErrors[0].summary }));
            return;
          } else if (result.validated === false && result.suggestedAddress) {
            resolve(result);
            return;
          }
          Meteor.call("accounts/addressBookUpdate", address, null, property, (err, res) => {
            if (err || !res) {
              reject(i18next.t("addressBookGrid.somethingWentWrong", { err: err.message }));
            } else {
              resolve(res);
            }
          });
          return;
        });
      }
      Meteor.call("accounts/addressBookUpdate", address, null, property, (err, res) => {
        if (err || !res) {
          reject(i18next.t("addressBookGrid.somethingWentWrong", { err: err.message }));
        } else {
          resolve(res);
        }
      });
    });
  },

  /**
   * @name removeAddress
   * @method
   * @memberof Helpers
   * @summary helper function that updates an address in the account's addressBook via a meteor method.
   * @since 2.0.0
   * @param {String} _id - _id of address to be removed.
   * @return {Promise}
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
   * @return {Promise}
   */
  addAddress(address, validateAddress = true) {
    return new Promise((resolve, reject) => {
    // This address was tried for validation
      if (validateAddress) {
        Meteor.call("accounts/validateAddress", address, (error, result) => {
          if (error || !result) {
            let errorMessage = (error && error.message) || "Validation Failed";
            if (error && error.error === "validation-error" && Array.isArray(error.details) && error.details.length) {
              // Add details of first invalid field from SimpleSchema
              errorMessage = error.details[0].message;
            }
            reject(i18next.t("addressBookAdd.failedToAddAddress", { err: errorMessage }));
            return;
          } else if (result.validated === false && !result.suggestedAddress) {
            reject(i18next.t("addressBookAdd.failedToAddAddress", { err: "Unable to fetch corrected address" }));
            return;
          } else if (result.validated === false && result.suggestedAddress && result.formErrors && result.formErrors.length > 0) {
            reject(i18next.t("addressBookAdd.failedToAddAddress", { err: result.formErrors[0].summary }));
            return;
          } else if (result.validated === false && result.suggestedAddress) {
            resolve(result);
            return;
          }
          Meteor.call("accounts/addressBookAdd", address, (err, res) => {
            if (err || !res) {
              reject(i18next.t("addressBookAdd.failedToAddAddress", { err: err.message }));
            } else {
              resolve(res);
            }
          });
        });
      } else {
        Meteor.call("accounts/addressBookAdd", address, (err, res) => {
          if (err || !res) reject(i18next.t("addressBookAdd.failedToAddAddress", { err: err.message }));
          if (res) resolve(res);
        });
      }
    });
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
   */
  onError(errorMessage) {
    Alerts.toast(errorMessage, "error");
  }
};

function composer(props, onData) {
  const handle = Meteor.subscribe("Accounts", Meteor.userId());
  if (!handle.ready()) {
    return;
  }
  const account = Collections.Accounts.findOne({ _id: Meteor.userId() });
  const { addressBook } = account.profile;
  const countries = Countries.find().fetch();
  const shop = Collections.Shops.findOne();
  const shopCountries = shop.locales.countries;

  const regionsByCountry = {};
  Object.keys(shopCountries).forEach((key) => {
    const { states } = shopCountries[key] || {};
    const regions = [];
    if (states) {
      // states is an object that needs to be convered
      // to an array of region labels and values
      Object.keys(states).forEach((i) => {
        regions.push({
          label: states[i].name,
          value: i
        });
      });
    }
    regionsByCountry[key] = regions;
  });
  // The initial mode for addressBook
  let initMode;
  const cart = Collections.Cart.findOne();
  // If we have passed the address step, show the grid
  if (cart.workflow.status !== "checkoutAddressBook") {
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
