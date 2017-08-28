/* eslint camelcase: 0 */
import { Meteor } from "meteor/meteor";
import { Packages } from "/lib/collections";
import { Reaction } from "/lib/api";


export const Express = {
  expressCheckoutAccountOptions: function () {
    const shopId = Reaction.getShopId();
    const settings = Packages.findOne({
      name: "reaction-paypal-express",
      shopId: shopId,
      enabled: true
    }).settings;
    let mode;
    if ((settings !== null ? settings.mode : void 0) === true) {
      mode = "production";
    } else {
      mode = "sandbox";
    }

    const options = {
      enabled: settings !== null ? settings.enabled : void 0,
      mode: mode,
      username: settings.username,
      password: settings.password,
      signature: settings.signature,
      merchantId: settings.merchantId,
      return_url: Meteor.absoluteUrl("paypal/done"),
      cancel_url: Meteor.absoluteUrl("paypal/cancel")
    };
    if (options.mode === "sandbox") {
      options.url = "https://api-3t.sandbox.paypal.com/nvp";
    } else {
      options.url = "https://api-3t.paypal.com/nvp";
    }
    return options;
  },
  config: function (options) {
    this.accountOptions = options;
  }
};
