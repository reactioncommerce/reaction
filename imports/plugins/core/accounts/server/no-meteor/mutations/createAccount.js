import SimpleSchema from "simpl-schema";
import ReactionError from "@reactioncommerce/reaction-error";
import sendWelcomeEmail from "../util/sendWelcomeEmail";

const inputSchema = new SimpleSchema({
  additionals: Object,
  shopId: String,
  tokenObj: {
    type: Object,
    optional: true
  },
  user: Object
});

/**
 * @name accounts/createAccount
 * @memberof Mutations/Accounts
 * @summary Invite new admin users (not consumers) to secure access in the dashboard to permissions
 * as specified in packages/roles
 * @param {Object} context - GraphQL execution context
 * @param {Object} input - Necessary input for mutation. See SimpleSchema.
 * @param {String} input.additionals - various account related data
 * @param {String} input.shopId - shop to create account for
 * @param {String} [input.tokenObj] - token information for account verification
 * @param {String} input.user - Meteor user to create account based on
 * @return {Promise<Object>} with boolean of found new account === true || false
 */
export default async function createAccount(context, input) {
  inputSchema.validate(input);
  const { appEvents, collections, userHasPermission } = context;
  const { Accounts } = collections;
  const {
    additionals,
    shopId,
    tokenObj,
    user
  } = input;

  // TODO: EK - Verify if this is this needed, or is it ok that anyone can create an account?
  if (!userHasPermission(["reaction-accounts", "account/invite"], shopId)) {
    throw new ReactionError("access-denied", "Access denied");
  }

  // Create initial account object from user and additionals
  const account = Object.assign({ shopId }, user, additionals);
  account.userId = user._id;

  // TODO: EK - Add roles / groups onto new account

  await Accounts.insertOne(account);

  if (tokenObj) {
    await sendWelcomeEmail(context, { shopId, token: tokenObj.token, userId: account.userId });
  }

  await appEvents.emit("afterAccountCreate", {
    account,
    createdBy: user._id
  });

  return account;
}
