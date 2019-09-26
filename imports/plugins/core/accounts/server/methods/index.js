import addUserPermissions from "./addUserPermissions";
import createFallbackLoginToken from "./createFallbackLoginToken";
import getUserId from "./getUserId";
import groupMethods from "./group";
import removeEmailAddress from "./removeEmailAddress";
import removeUserPermissions from "./removeUserPermissions";
import setActiveShopId from "./setActiveShopId";
import setUserPermissions from "./setUserPermissions";
import updateEmailAddress from "./updateEmailAddress";
import updateServiceConfiguration from "./updateServiceConfiguration";
import verifyAccount from "./verifyAccount";

/**
 * @file Extends Meteor's {@link https://github.com/meteor/meteor/tree/master/packages/accounts-base Accounts-Base}
 * with methods for Reaction-specific behavior and user interaction. Run these methods using: `Meteor.call()`
 * @example Meteor.call("accounts/verifyAccount", email, token)
 * @namespace Accounts/Methods
 */

/**
 * @file Meteor methods for Reaction
 *
 *
 * @namespace Reaction/Methods
*/

export default {
  "accounts/addUserPermissions": addUserPermissions,
  "accounts/createFallbackLoginToken": createFallbackLoginToken,
  "accounts/removeEmailAddress": removeEmailAddress,
  "accounts/removeUserPermissions": removeUserPermissions,
  "accounts/setActiveShopId": setActiveShopId,
  "accounts/setUserPermissions": setUserPermissions,
  "accounts/updateEmailAddress": updateEmailAddress,
  "accounts/updateServiceConfiguration": updateServiceConfiguration,
  "accounts/verifyAccount": verifyAccount,
  "reaction/getUserId": getUserId,
  ...groupMethods
};
