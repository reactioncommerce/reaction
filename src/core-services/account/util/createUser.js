import { Accounts } from "meteor/accounts-base";

/**
 * @summary Call identity provider to ask for a new user to be created.
 * @param {Object} options Options
 * @return {String} User ID
 */
export default async function createUser(options) {
  // TODO This will call out to IDP server in 3.0.0
  return Accounts.createUser(options);
}
