// A large number of expiration days (approximately 100 years worth) that is
// used when creating unexpiring tokens.
const LOGIN_UNEXPIRING_TOKEN_DAYS = 365 * 100;

// This is what Meteor's Accounts._getTokenLifetimeMs returns for Reaction's current settings
const tokenLifetimeMs = LOGIN_UNEXPIRING_TOKEN_DAYS * 24 * 60 * 60 * 1000;

/**
 * @name tokenExpiration
 * @method
 * @memberof GraphQL
 * @summary Meteor's Accounts._tokenExpiration
 * @param {Date} when - A date from which token expiration date should be calculated
 * @returns {Date} A date that is `tokenLifetimeMs` after the "when" date
 */
export default function tokenExpiration(when) {
  // We pass when through the Date constructor for backwards compatibility;
  // `when` used to be a number.
  return new Date((new Date(when)).getTime() + tokenLifetimeMs);
}
