import { Meteor } from "meteor/meteor";
import buildContext from "/imports/node-app/core/util/buildContext";
import collections from "/imports/collections/rawCollections";

let baseContext = {};

/**
 * @summary Sets the baseContext used by getGraphQLContextInMeteorMethod
 * @param {Object} context The context object
 * @returns {undefined}
 */
export function setBaseContext(context) {
  baseContext = context;
}

/**
 * @summary Gets the baseContext used by getGraphQLContextInMeteorMethod
 * @returns {Object} The context object
 */
export function getBaseContext() {
  return baseContext;
}

/**
 * Calls buildContext to build a GraphQL context object, after first looking up
 * the user by userId in collections.users.
 *
 * Usage in a Meteor method:
 *
 * ```js
 * const context = Promise.await(getGraphQLContextInMeteorMethod(this.userId));
 * ```
 *
 * @method getGraphQLContextInMeteorMethod
 * @summary Call this in a Meteor method that wraps a GraphQL mutation, to get a context
 *   to pass to the mutation.
 * @param {String} userId - The user ID for the current request
 * @return {Object} A GraphQL context object
 */
export default async function getGraphQLContextInMeteorMethod(userId) {
  let user;
  if (userId) {
    user = await collections.users.findOne({ _id: userId });
    if (!user) throw new Error(`No user found with ID ${userId}`);
  }

  const meteorContext = { ...baseContext };

  const request = { user };

  await buildContext(meteorContext, request);

  // Since getGraphQLContextInMeteorMethod is to be called within a Meteor method with Meteor running,
  // we can pass through callMeteorMethod to Meteor.apply.
  meteorContext.callMeteorMethod = (methodName, ...args) => Meteor.apply(methodName, args);

  return meteorContext;
}
