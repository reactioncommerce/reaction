import { Meteor } from "meteor/meteor";

/**
 * @name accounts/currentUserHasPassword
 * @method
 * @memberof Accounts/Methods
 * @summary Check if current user has password
 * @returns {Boolean} True if current user has password
 * @private
 */
export default function currentUserHasPassword() {
  const user = Meteor.users.findOne(Meteor.userId());
  return !!user.services.password;
}
