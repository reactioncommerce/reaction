import SimpleSchema from "simpl-schema";
import ReactionError from "@reactioncommerce/reaction-error";
import sendWelcomeEmail from "../util/sendWelcomeEmail";

const inputSchema = new SimpleSchema({
  additionals: {
    type: Object,
    blackbox: true
  },
  groupId: {
    type: String,
    optional: true
  },
  shopId: String,
  tokenObj: {
    type: Object,
    optional: true,
    blackbox: true
  },
  user: {
    type: Object,
    blackbox: true
  }
});

/**
 * @name accounts/createAccount
 * @memberof Mutations/Accounts
 * @summary Invite new admin users (not consumers) to secure access in the dashboard to permissions
 * as specified in packages/roles
 * @param {Object} context - GraphQL execution context
 * @param {Object} input - Necessary input for mutation. See SimpleSchema.
 * @param {String} input.additionals - various account related data
 * @param {String} [input.groupId] - group to add account to
 * @param {String} input.shopId - shop to create account for
 * @param {String} [input.tokenObj] - token information for account verification
 * @param {String} input.user - Meteor user to create account based on
 * @return {Promise<Object>} with boolean of found new account === true || false
 */
export default async function createAccount(context, input) {
  inputSchema.validate(input);
  const { appEvents, collections, userHasPermission } = context;
  const { Accounts, Groups } = collections;
  const {
    additionals,
    groupId,
    shopId,
    tokenObj,
    user
  } = input;

  // TODO: EK - Verify if this is this needed, or is it ok that anyone can create an account?
  // if (!userHasPermission(["reaction-accounts", "account/invite"], shopId)) {
  //   throw new ReactionError("access-denied", "Access denied");
  // }

  // Create initial account object from user and additionals
  const account = Object.assign({ shopId }, user, additionals);
  account.userId = user._id;

  // if we don't have user.services we're an anonymous user
  if (!user.services) {
    // TODO: look into getting rid of this guest account
    const group = await Groups.findOne({ slug: "guest", shopId });
    if (group) {
      account.groups = [group._id];
    }
  } else {
    let group;
    if (groupId) {
      group = await Groups.findOne({ _id: groupId, shopId });
    } else {
      group = await Groups.findOne({ slug: "customer", shopId });
    }
    if (group) {
      account.groups = [group._id];
    }
  }

  // also add services with email defined to user.emails[]
  const userServices = user.services;
  for (const service in userServices) {
    if ({}.hasOwnProperty.call(userServices, service)) {
      const serviceObj = userServices[service];

      if (serviceObj.name) {
        account.profile.name = serviceObj.name;
      }
      // TODO: For now we have here instagram, twitter and google avatar cases
      // need to make complete list
      if (serviceObj.picture) {
        account.profile.picture = user.services[service].picture;
      } else if (serviceObj.profile_image_url_https) {
        account.profile.picture = user.services[service].dprofile_image_url_https;
      } else if (serviceObj.profile_picture) {
        account.profile.picture = user.services[service].profile_picture;
      }
      // Correctly map Instagram profile data to Meteor user / Accounts
      if (userServices.instagram) {
        account.name = serviceObj.full_name;
        account.profile.picture = serviceObj.profile_picture;
        account.profile.bio = serviceObj.bio;
        account.profile.name = serviceObj.full_name;
        account.profile.username = serviceObj.username;
      }
    }
  }

  // remove `services` from the account before creating
  delete account.services;

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
