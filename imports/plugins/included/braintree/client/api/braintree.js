import { Meteor } from "meteor/meteor";
import { Packages } from "/lib/collections";
import { Reaction } from "/client/api";

getSettings = function (settings, ref, valueName) {
  if (settings !== null) {
    return settings[valueName];
  } else if (ref !== null) {
    return ref[valueName];
  }
};

export const Braintree =
  {
    accountOptions() {
      let environment;
      let settings = Packages.findOne({
        name: "reaction-braintree",
        shopId: Reaction.getShopId(),
        enabled: true
      }).settings;
      if (typeof settings !== "undefined" && settings !== null ? settings.mode : undefined === true) {
        environment = "production";
      } else {
        environment = "sandbox";
      }
  
      let ref = Meteor.settings.braintree;
      let options = {
        environment: environment,
        merchantId: getSettings(settings, ref, "merchant_id"),
        publicKey: getSettings(settings, ref, "public_key"),
        privateKey: getSettings(settings, ref, "private_key")
      };
      if (!options.merchantId) {
        throw new Meteor.Error("invalid-credentials", "Invalid Braintree Credentials");
      }
      return options;
    },

    // authorize submits a payment authorization to Braintree
    authorize(cardData, paymentData, callback) {
      Meteor.call("braintreeSubmit", "authorize", cardData, paymentData, callback);
    }
};
