/* eslint camelcase: 0 */
import { Meteor } from "meteor/meteor";

export const Stripe = {
  authorize: function (cardInfo, paymentInfo, callback) {
    Meteor.call("stripeSubmit", "authorize", cardInfo, paymentInfo, callback);
  }
};
