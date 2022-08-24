import Random from "@reactioncommerce/random";
import ReactionError from "@reactioncommerce/reaction-error";

/**
 * @summary Creates a verification token object to pass to our
 * accounts / users collections for account verification purposes
 * @param {Object} [address] email address to create token for
 * @param {String} [email] email address to create token for
 * @returns {Object} Token object
 */
export default function generateVerificationTokenObject({ address, email }) {
  if (!address && !email) throw new ReactionError("error-occurred", "Address or email required");

  const tokenObj = {
    token: Random.secret(),
    when: new Date()
  };

  if (address) {
    tokenObj.address = address;
  }

  if (email) {
    tokenObj.email = email;
  }

  return tokenObj;
}
