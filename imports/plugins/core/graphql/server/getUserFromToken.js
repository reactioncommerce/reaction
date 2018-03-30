import crypto from "crypto";
import ReactionError from "./ReactionError";

// A large number of expiration days (approximately 100 years worth) that is
// used when creating unexpiring tokens.
const LOGIN_UNEXPIRING_TOKEN_DAYS = 365 * 100;

// This is Meteor's Accounts._hashLoginToken
function hashLoginToken(loginToken) {
  const hash = crypto.createHash("sha256");
  hash.update(loginToken);
  return hash.digest("base64");
}

// This is what Meteor's Accounts._getTokenLifetimeMs returns for Reaction's current settings
const tokenLifetimeMs = LOGIN_UNEXPIRING_TOKEN_DAYS * 24 * 60 * 60 * 1000;

// This is Meteor's Accounts._tokenExpiration
function tokenExpiration(when) {
  // We pass when through the Date constructor for backwards compatibility;
  // `when` used to be a number.
  return new Date((new Date(when)).getTime() + tokenLifetimeMs);
}

async function getUserFromToken(loginToken, context) {
  const { collections } = context;
  const { users } = collections;

  const hashedToken = hashLoginToken(loginToken);

  // search for user from the database with hashedToken
  // note: no need for a fiber aware findOne
  const currentUser = await users.findOne({
    "services.resume.loginTokens.hashedToken": hashedToken
  });

  if (!currentUser) throw new ReactionError("access-denied", "Token invalid");

  // find the right login token because the user may have
  // several sessions logged in on different browsers/computers
  const tokenInformation = currentUser.services.resume.loginTokens.find((tokenInfo) => tokenInfo.hashedToken === hashedToken);

  // get token expiration date
  const expiresAt = tokenExpiration(tokenInformation.when);

  const isExpired = expiresAt < new Date();
  if (isExpired) throw new ReactionError("access-denied", "Token expired");

  return currentUser;
}

export default getUserFromToken;
