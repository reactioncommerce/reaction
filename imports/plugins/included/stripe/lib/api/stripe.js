/* eslint camelcase: 0 */

export const Stripe = {
  authorize: function (cardInfo, paymentInfo, callback) {
    Meteor.call("stripeSubmit", "authorize", cardInfo, paymentInfo, callback);
  }
};
