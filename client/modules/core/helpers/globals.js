import _ from "lodash";
import { Session } from "meteor/session";

/**
 * @name toggleSession
 * @method
 * @memberof Helpers
 * @todo These should all be removed. PR's happily accepted.
 * @summary Quick and easy snippet for toggling sessions
 * @param {String} sessionVariable - string name, see http://docs.meteor.com/#/basic/session
 * @param {String} positiveState - optional, if is is positiveState, set opposite
 * @returns {Object} return session value
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
 * @returns {String} card label, ie: visa
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
