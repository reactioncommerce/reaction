/* global paypal */
import _ from "lodash";
import { Meteor } from "meteor/meteor";
import { Session } from "meteor/session";
import { ReactiveDict } from "meteor/reactive-dict";
import { Template } from "meteor/templating";
import { i18next } from "/client/api";
import { Cart } from "/lib/collections";
import { PaypalClientAPI } from "../../../lib/paypalRestApi";
import "./checkoutButton.html";

/**
 * PayPal Checkout Button
 *
 * This is the PayPal Express Checkout button that displays opens a popup,
 * provided by paypal.
 */

/**
 * Checkout - Open PayPal Express popup
 * @return {undefined} no return value
 */
function checkout() {
  paypal.checkout.initXO();
  const cart = Cart.findOne();
  if (!cart) {
    return undefined;
  }

  return Meteor.call("getExpressCheckoutToken", cart._id, (error, token) => {
    if (error) {
      const msg = (error !== null ? error.error : undefined) || i18next.t("checkoutPayment.processingError", "There was a problem with your payment.");
      Alerts.add(msg, "danger", {
        placement: "paymentMethod"
      });
      return paypal.checkout.closeFlow();
    }
    const url = paypal.checkout.urlPrefix + token;
    return paypal.checkout.startFlow(url);
  });
}

/**
 * Validate express checkout settings object
 * @param  {Object} settings Object containing "merchantId" and "mode":
 * @return {Boolean} true if valid, false otherwise
 */
function expressCheckoutSettingsValid(settings) {
  return _.isEmpty(settings.merchantId) === false && _.isEmpty(settings.mode) === false;
}

/**
 * PayPal checkout onCreate
 * @param  {Function} function to execute when template is created
 * @return {undefined} no return value
 */
Template.paypalCheckoutButton.onCreated(function () {
  Meteor.call("getExpressCheckoutSettings", (error, expressCheckoutSettings) => {
    if (!error) {
      return Session.set("expressCheckoutSettings", expressCheckoutSettings);
    }
  });
  PaypalClientAPI.load();
  this.state = new ReactiveDict();
  this.state.setDefault({
    isConfigured: true,
    isLoading: true
  });
});

/**
 * PayPal checkout onRendered
 * @param  {Function} function to execute when template is rendered
 * @return {undefined} no return value
 */
Template.paypalCheckoutButton.onRendered(function () {
  const element = this.$(".js-paypal-express-checkout")[0];

  this.autorun(() => {
    if (PaypalClientAPI.loaded()) {
      const expressCheckoutSettings = Session.get("expressCheckoutSettings");
      if (expressCheckoutSettingsValid(expressCheckoutSettings)) {
        // setup paypal button for this checkout
        // gives nada back to us?
        paypal.checkout.setup(expressCheckoutSettings.merchantId, {
          environment: expressCheckoutSettings.mode,
          button: element,
          // Blank function to disable default paypal onClick functionality
          click() {}
        });
        this.state.set("isLoading", false);
      } else {
        this.state.set("isConfigured", false);
        this.state.set("isLoading", false);
      }
    } else {
      this.state.set("isLoading", true);
    }
  });
});

/**
 * PayPal checkout button helpers
 */
Template.paypalCheckoutButton.helpers({
  expressCheckoutEnabled() {
    const expressCheckoutSettings = Session.get("expressCheckoutSettings");
    return expressCheckoutSettings !== undefined ? expressCheckoutSettings.enabled : undefined;
  },
  /**
   * Check for proper configuration of PayPal Express Checkout settings.
   * This function only validates that the required settings exist and are not empty.
   * @return {Boolean} true if properly configured, false otherwise
   */
  isConfigured() {
    return Template.instance().state.equals("isConfigured", true);
  }
});

/**
 * PayPal checkout button events
 */
Template.paypalCheckoutButton.events({

  /**
   * Click Event: Express Checkout Button
   * @return {undefined} no return value
   */
  "click .js-paypal-express-checkout"() {
    return checkout();
  }
});
