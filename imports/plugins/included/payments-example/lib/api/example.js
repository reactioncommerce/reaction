import { Meteor } from "meteor/meteor";
import { Packages } from "/lib/collections";

export const Example = {
  accountOptions: function () {
    const settings = Packages.findOne({
      name: "reaction-paymentmethod"
    }).settings;
    if (!settings.apiKey) {
      throw new Meteor.Error("invalid-credentials", "Invalid Credentials");
    }
    return settings.apiKey;
  },

  authorize: function (cardInfo, paymentInfo, callback) {
    Meteor.call("exampleSubmit", "authorize", cardInfo, paymentInfo, callback);
  }
};
