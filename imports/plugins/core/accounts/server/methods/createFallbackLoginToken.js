import { Accounts as MeteorAccounts } from "meteor/accounts-base";

/**
 * @name accounts/createFallbackLoginToken
 * @memberof Accounts/Methods
 * @method
 * @summary Returns a new loginToken for current user, that can be used for special login scenarios
 * e.g. store the newly created token as cookie on the browser, if the client does not offer local storage.
 * @returns {String|null} loginToken for current user
 */
export default function createFallbackLoginToken() {
  if (this.userId) {
    const stampedLoginToken = MeteorAccounts._generateStampedLoginToken();
    const loginToken = stampedLoginToken.token;
    MeteorAccounts._insertLoginToken(this.userId, stampedLoginToken);
    return loginToken;
  }

  return null;
}
