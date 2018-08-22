import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import * as Schemas from "/lib/collections/schemas";
import addressBookAddMutation from "../no-meteor/mutations/addressBookAdd";
import getGraphQLContextInMeteorMethod from "/imports/plugins/core/graphql/server/getGraphQLContextInMeteorMethod";

/**
 * @name accounts/addressBookAdd
 * @memberof Methods/Accounts
 * @method
 * @summary Add new addresses to an account
 * @example Meteor.call("accounts/addressBookAdd", address, callBackFunction(error, result))
 * @param {Object} address - address
 * @param {String} [accountUserId] - `account.userId` used by admin to edit users
 * @param {String} [cartId] - The cart ID, if adding an address during checkout
 * @return {Object} with updated address
 */
export default function addressBookAdd(address, accountUserId, cartId) {
  Schemas.Address.validate(address);
  check(accountUserId, Match.Maybe(String));
  check(cartId, Match.Maybe(String));

  this.unblock();

  const context = Promise.await(getGraphQLContextInMeteorMethod(Meteor.userId(), this.connection));
  return addressBookAddMutation(context, address, accountUserId);
}
