import _, { difference } from "lodash";
import SimpleSchema from "simpl-schema";
import Logger from "@reactioncommerce/logger";
import Random from "@reactioncommerce/random";
import ReactionError from "@reactioncommerce/reaction-error";
import { Meteor } from "meteor/meteor";
import { Accounts as MeteorAccounts } from "meteor/accounts-base";
import { check } from "meteor/check";
import getGraphQLContextInMeteorMethod from "/imports/plugins/core/graphql/server/getGraphQLContextInMeteorMethod";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import getCurrentUserName from "/imports/plugins/core/accounts/server/no-meteor/util/getCurrentUserName";
import ensureRoles from "/imports/plugins/core/accounts/server/no-meteor/util/ensureRoles";
import getDataForEmail from "/imports/plugins/core/accounts/server/util/getDataForEmail";

const inputSchema = new SimpleSchema({
  email: String,
  groupId: String,
  name: String,
  shopId: String
});

/**
 * @name accounts/inviteShopMember
 * @memberof Mutations/Accounts
 * @summary Invite new admin users (not consumers) to secure access in the dashboard to permissions
 * as specified in packages/roles
 * @param {Object} context - GraphQL execution context
 * @param {Object} input - Necessary input for mutation. See SimpleSchema.
 * @param {String} input.shopId - shop to invite user
 * @param {String} input.groupId - groupId to invite user
 * @param {String} input.email - email of invitee
 * @param {String} input.name - name of invitee
 * @return {Promise<Object>} with boolean of found new account === true || false
 */
export default async function inviteShopMember(context, input) {
  inputSchema.validate(input);
  const { appEvents, collections, userHasPermission, userId: userIdFromContext } = context;
  const { Accounts, Groups, Shops } = collections;
  const {
    email,
    groupId,
    name,
    shopId
  } = input;

  console.log(" ----- ----- shopId, email, name, groupId", shopId, email, name, groupId);


  const shop = await Shops.findOne({ _id: shopId });
  const primaryShop = Reaction.getPrimaryShop(); // TODO: why are we finding this????

  if (!shop) throw new ReactionError("not-found", "No shop found");

  if (!userHasPermission(["reaction-accounts"], shopId)) {
    throw new ReactionError("access-denied", "Access denied");
  }











  const account = await Accounts.findOne({ _id: "gmmXCCNE5h5CsBCm7" });

  return account;




//   // given that we `export` this function, there is an expectation that it can
//   // be imported and used elsewhere in the code. the use of `this` in this
//   // method requires that the context be Meteor, and further, `this.unblock()`
//   // assumes that this is being run as a Meteor method. Consider using a small
//   // function in the Meteor.method section below to call unblock, and pass any
//   // Meteor-defined data (e.g., userId) as a parameter to allow for this method
//   // to be reused.
//   this.unblock();

//   const shop = Shops.findOne(shopId);
//   const primaryShop = Reaction.getPrimaryShop();

//   if (!shop) {
//     const msg = `accounts/inviteShopMember - Shop ${shopId} not found`;
//     Logger.error(msg);
//     throw new Meteor.Error("not-found", msg);
//   }

//   if (!Reaction.hasPermission("reaction-accounts", this.userId, shopId)) {
//     Logger.error(`User ${this.userId} does not have reaction-accounts permissions`);
//     throw new ReactionError("access-denied", "Access denied");
//   }


console.log(" ----------------------------------- we here");


//   const group = Groups.findOne({ _id: groupId }) || {};

//   // check to ensure that user has roles required to perform the invitation
//   if (!Reaction.canInviteToGroup({ group, user: Meteor.user() })) {
//     throw new ReactionError("access-denied", "Cannot invite to group");
//   }

//   if (group.slug === "owner") {
//     throw new ReactionError("bad-request", "Cannot directly invite owner");
//   }

//   const currentUser = Meteor.user();
//   const currentUserName = getCurrentUserName(currentUser);
//   const user = Meteor.users.findOne({ "emails.address": email });
//   const matchingEmail = user &&
//     user.emails &&
//     user.emails.find((emailObject) => emailObject.address === email);

//   const isEmailVerified = matchingEmail && matchingEmail.verified;
//   const token = Random.id();

//   let dataForEmail;
//   let userId;
//   let templateName;

//   if (user) {
//     userId = user._id;
//   }

//   const context = Promise.await(getGraphQLContextInMeteorMethod(Reaction.getUserId()));

//   // If the user already has an account, send informative email, not "invite" email
//   if (user && isEmailVerified) {
//     // The user already exists, we promote the account, rather than creating a new one
//     const account = Accounts.findOne({ userId });
//     if (!account) throw new ReactionError("not-found", "User found but matching account not found");

//     Promise.await(context.mutations.addAccountToGroup({ ...context, isInternalCall: true }, {
//       accountId: account._id,
//       groupId
//     }));

//     // do not send token, as no password reset is needed
//     const url = Reaction.absoluteUrl();

//     // use primaryShop's data (name, address etc) in email copy sent to new shop manager
//     dataForEmail = getDataForEmail({ shop: primaryShop, currentUserName, name, url });

//     // Get email template and subject
//     templateName = "accounts/inviteShopMember";
//   } else {
//     // There could be an existing user with an invite still pending (not activated).
//     // We create a new account only if there's no pending invite.
//     if (!user) {
//       // The user does not already exist, we need to create a new account
//       userId = MeteorAccounts.createUser({
//         profile: { invited: true },
//         email,
//         name,
//         groupId
//       });
//     }

//     // set token to be used for first login for the new account
//     const tokenUpdate = {
//       "services.password.reset": { token, email, when: new Date() },
//       name
//     };
//     Meteor.users.update(userId, { $set: tokenUpdate });

//     // use primaryShop's data (name, address etc) in email copy sent to new shop manager
//     dataForEmail = getDataForEmail({ shop: primaryShop, currentUserName, name, token });

//     // Get email template and subject
//     templateName = "accounts/inviteNewShopMember";
//   }

//   dataForEmail.groupName = _.startCase(group.name);

//   // send invitation email from primary shop email
//   Promise.await(context.mutations.sendEmail(context, {
//     data: dataForEmail,
//     fromShop: primaryShop,
//     templateName,
//     to: email
//   }));

//   return Accounts.findOne({ userId });
//

}
