import { check, Match } from "meteor/check";
import * as Schemas from "/lib/collections/schemas";
import buildMeteorContext from "/imports/plugins/core/graphql/server/buildMeteorContext";
import addressBookAddMutation from "../no-meteor/mutations/addressBookAdd";

/**
 * @name accounts/addressBookAdd
 * @memberof Methods/Accounts
 * @method
 * @summary Add new addresses to an account
 * @example Meteor.call("accounts/addressBookAdd", address, callBackFunction(error, result))
 * @param {Object} address - address
 * @param {String} [accountUserId] - `account.userId` used by admin to edit users
 * @return {Object} with updated address
 */
export default function addressBookAdd(address, accountUserId) {
  Schemas.Address.validate(address);
  check(accountUserId, Match.Maybe(String));

  this.unblock();

  const context = Promise.await(buildMeteorContext(this.userId));
  return addressBookAddMutation(context, address, accountUserId);
}
