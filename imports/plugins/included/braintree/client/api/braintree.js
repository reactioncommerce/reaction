import { Meteor } from "meteor/meteor";

export const Braintree =
  {// authorize submits a payment authorization to Braintree
    authorize(cardData, paymentData, callback) {
      Meteor.call("braintreeSubmit", "authorize", cardData, paymentData, callback);
    }
  };
