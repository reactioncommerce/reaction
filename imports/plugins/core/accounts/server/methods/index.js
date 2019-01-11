import addressBookAdd from "./addressBookAdd";
import addressBookRemove from "./addressBookRemove";
import addressBookUpdate from "./addressBookUpdate";
import addUserPermissions from "./addUserPermissions";
import createFallbackLoginToken from "./createFallbackLoginToken";
import currentUserHasPassword from "./currentUserHasPassword";
import getUserId from "./getUserId";
import groupMethods from "./group";
import inviteShopMember from "./inviteShopMember";
import inviteShopOwner from "./inviteShopOwner";
import markAddressValidationBypassed from "./markAddressValidationBypassed";
import removeEmailAddress from "./removeEmailAddress";
import removeUserPermissions from "./removeUserPermissions";
import sendResetPasswordEmail from "./sendResetPasswordEmail";
import setProfileCurrency from "./setProfileCurrency";
import setUserPermissions from "./setUserPermissions";
import updateEmailAddress from "./updateEmailAddress";
import updateServiceConfiguration from "./updateServiceConfiguration";
import validateAddress from "./validateAddress";
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
  "accounts/addressBookAdd": addressBookAdd,
  "accounts/addressBookRemove": addressBookRemove,
  "accounts/addressBookUpdate": addressBookUpdate,
  "accounts/addUserPermissions": addUserPermissions,
  "accounts/createFallbackLoginToken": createFallbackLoginToken,
  "accounts/currentUserHasPassword": currentUserHasPassword,
  "accounts/inviteShopMember": inviteShopMember,
  "accounts/inviteShopOwner": inviteShopOwner,
  "accounts/markAddressValidationBypassed": markAddressValidationBypassed,
  "accounts/removeEmailAddress": removeEmailAddress,
  "accounts/removeUserPermissions": removeUserPermissions,
  "accounts/sendResetPasswordEmail": sendResetPasswordEmail,
  "accounts/setProfileCurrency": setProfileCurrency,
  "accounts/setUserPermissions": setUserPermissions,
  "accounts/updateEmailAddress": updateEmailAddress,
  "accounts/updateServiceConfiguration": updateServiceConfiguration,
  "accounts/validateAddress": validateAddress,
  "accounts/verifyAccount": verifyAccount,
  "reaction/getUserId": getUserId,
  ...groupMethods
};
