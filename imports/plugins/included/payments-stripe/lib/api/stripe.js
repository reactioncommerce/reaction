import { Meteor } from "meteor/meteor";

export const Stripe = {
  authorize: function (cardData, paymentInfo, callback) {
    Meteor.call("stripeSubmit", "authorize", cardData, paymentInfo, (error, result) => {
      callback(error, result);
    });
  }
};
