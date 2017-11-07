import _ from "lodash";
import { Session } from "meteor/session";
import { Meteor } from "meteor/meteor";
import { Roles } from "meteor/alanning:roles";

/* eslint "no-extend-native": [2, {"exceptions": ["String"]}] */
/* eslint "no-alert": 0 */

/**
 * @name toggleSession
 * @method
 * @memberof Helpers
 * @todo These should all be removed. PR's happily accepted.
 * @summary Quick and easy snippet for toggling sessions
 * @param {String} sessionVariable - string name, see http://docs.meteor.com/#/basic/session
 * @param {String} positiveState - optional, if is is positiveState, set opposite
 * @return {Object} return session value
 */
export function toggleSession(sessionVariable, positiveState) {
  const session = Session.get(sessionVariable);
  const positive = positiveState || true;
  if (_.isEqual(positive, session)) {
    Session.set(sessionVariable, false);
  } else {
    Session.set(sessionVariable, positive);
  }
  return Session.get(sessionVariable);
}

/**
 * @name getCardTypes
 * @method
 * @memberof Helpers
 * @todo These should all be removed. PR's happily accepted.
 * @summary Determine the card type and return label
 * @todo needs i18n conversion?
 * @param {String} cardNumber - a credit card number
 * @return {String} card label, ie: visa
 */
export function getCardType(cardNumber) {
  let re = new RegExp("^4");
  if (cardNumber.match(re) !== null) {
    return "visa";
  }
  re = new RegExp("^(34|37)");
  if (cardNumber.match(re) !== null) {
    return "amex";
  }
  re = new RegExp("^5[1-5]");
  if (cardNumber.match(re) !== null) {
    return "mastercard";
  }
  re = new RegExp("^6011");
  if (cardNumber.match(re) !== null) {
    return "discover";
  }
  return "";
}

/**
 * @name getGuestLoginState
 * @method
 * @memberof Helpers
 * @todo These should all be removed. PR's happily accepted.
 * @summary Determines if a guest checkout is enabled and the login state for users
 * @return {Boolean} true if authenticated user
 */
export function getGuestLoginState() {
  if (Meteor.userId() === "string" && this.getShopId() && this.allowGuestCheckout()) {
    const isGuestFlow = Session.equals("guestCheckoutFlow", true);
    const isGuest = Roles.userIsInRole(Meteor.userId(), "guest", this.getShopId());
    const isAnonymous = Roles.userIsInRole(Meteor.userId(), "anonymous", this.getShopId());
    if (!isGuestFlow && !isGuest && isAnonymous) {
      return false;
    } else if (!isGuestFlow && isGuest && !isAnonymous) {
      return true;
    }
  } else if (Session.equals("guestCheckoutFlow", true) && _.pluck(Meteor.user()
    .emails, "address")) {
    return true;
  }
  return false;
}
