import { Meteor } from "meteor/meteor";
import Reaction from "/imports/plugins/core/core/server/Reaction";

/**
 * @name accounts/currentUserHasPassword
 * @method
 * @memberof Accounts/Methods
 * @summary Check if current user has password
 * @returns {Boolean} True if current user has password
 * @private
 */
export default function currentUserHasPassword() {
  const user = Meteor.users.findOne(Reaction.getUserId());
  return !!user.services.password;
}
