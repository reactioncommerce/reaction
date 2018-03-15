import { Accounts } from "meteor/accounts-base";
import { Meteor } from "meteor/meteor";

async function getUserFromToken(loginToken) {
  const hashedToken = Accounts._hashLoginToken(loginToken);

  // search for user from the database with hashedToken
  // note: no need for a fiber aware findOne
  const currentUser = await Meteor.users.rawCollection().findOne({
    "services.resume.loginTokens.hashedToken": hashedToken
  });

  if (!currentUser) throw new Error("Token invalid");

  // find the right login token because the user may have
  // several sessions logged in on different browsers/computers
  const tokenInformation = currentUser.services.resume.loginTokens.find((tokenInfo) => tokenInfo.hashedToken === hashedToken);

  // get token expiration date
  const expiresAt = Accounts._tokenExpiration(tokenInformation.when);

  const isExpired = expiresAt < new Date();
  if (isExpired) throw new Error("Token expired");

  return currentUser;
}

export default getUserFromToken;
