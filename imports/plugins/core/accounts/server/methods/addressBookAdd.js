import { check, Match } from "meteor/check";
import { Meteor } from "meteor/meteor";
import * as Schemas from "/lib/collections/schemas";
import { Accounts, Cart } from "/lib/collections";
import addressBookAddMutation from "../mutations/addressBookAdd";
import { getHasPermissionFunctionForUser } from "../no-meteor/hasPermission";

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
  check(accountUserId, Match.Optional(String));

  this.unblock();

  const user = Meteor.users.findOne({ _id: this.userId });

  const context = {
    collections: {
      Accounts: Accounts.rawCollection(),
      Cart: Cart.rawCollection(),
      users: Meteor.users.rawCollection()
    },
    userHasPermission: getHasPermissionFunctionForUser(user),
    user,
    userId: this.userId
  };

  return addressBookAddMutation(context, address, accountUserId);
}
