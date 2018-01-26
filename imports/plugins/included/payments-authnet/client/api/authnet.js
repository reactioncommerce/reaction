/* eslint camelcase: 0 */
import { Meteor } from "meteor/meteor";

export const AuthNet = {
  authorize(cardInfo, paymentInfo, callback) {
    Meteor.call("authnetSubmit", "authorizeTransaction", cardInfo, paymentInfo, callback);
  }
};
