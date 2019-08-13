import { Meteor } from "meteor/meteor";

/**
 * @method getUserId
 * @summary returns the userId of logged in user (e.g Meteor.userId())
 * @returns {String} String
 */
export function getUserId() {
  return Meteor.userId();
}
