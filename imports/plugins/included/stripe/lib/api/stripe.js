/* eslint camelcase: 0 */
import { Meteor } from "meteor/meteor";

export const Stripe = {
  charge: function (cardData, paymentInfo, callback) {
    Meteor.call("stripeSubmit", "charge", cardData, paymentInfo, callback);
  }
};
