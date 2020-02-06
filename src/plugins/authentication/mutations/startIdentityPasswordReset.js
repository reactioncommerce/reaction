import ReactionError from "@reactioncommerce/reaction-error";
import SimpleSchema from "simpl-schema";
import generateVerificationTokenObject from "@reactioncommerce/api-utils/generateVerificationTokenObject.js";

const inputSchema = new SimpleSchema({
  email: String,
  userId: String
});

/**
 * @name authentication/startIdentityPasswordReset
 * @memberof Mutations/Authentication
 * @summary Start an email verification by generating a token, saving it to the user
 *   record, and returning it. This mutation is only intended to be called internally
 *   by other plugins.
 * @param {Object} context - App context
 * @param {Object} input - Input arguments
 * @param {String} input.email - Email address to verify. Must be an address the user has.
 * @param {String} input.userId - The user ID
 * @return {Promise<Object>} Object with `token` key
 */
export default async function startIdentityPasswordReset(context, input) {
  inputSchema.validate(input);
  const { collections: { users } } = context;

  const { email, userId } = input;

  // Make sure the user exists, and email is one of their addresses.
  const user = await users.findOne({ _id: userId });
  if (!user) throw new ReactionError("not-found", "User not found");

  // make sure we have a valid email
  if (!email || !user.emails || !user.emails.map((mailInfo) => mailInfo.address).includes(email)) {
    throw new ReactionError("not-found", "Email not found");
  }

  // Create token for password reset
  const tokenObj = generateVerificationTokenObject({ email });

  try {
    await users.updateOne({ _id: userId }, {
      $set: {
        "services.password.reset": tokenObj
      }
    });
  } catch (error) {
    throw new ReactionError("error-occurred", "Unable to set password reset token");
  }

  return { token: tokenObj.token };
}
