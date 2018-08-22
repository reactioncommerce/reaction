import { Meteor } from "meteor/meteor";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import appEvents from "/imports/plugins/core/core/server/appEvents";
import buildContext from "./no-meteor/buildContext";
import collections from "/imports/collections/rawCollections";

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
 * @param {Object} methodConnection - this.connection called from within a Meteor method
 * @return {Object} A GraphQL context object
 */
export default async function getGraphQLContextInMeteorMethod(userId, methodConnection) {
  let user;
  if (userId) {
    user = await collections.users.findOne({ _id: userId });
    if (!user) throw new Error(`No user found with ID ${userId}`);
  }

  const meteorContext = { appEvents, collections };

  const { httpHeaders } = methodConnection;
  const request = {
    user,
    headers: {
      origin: Reaction.absoluteUrl().slice(0, -1),
      ...httpHeaders
    }
  };

  await buildContext(meteorContext, request);

  // Since getGraphQLContextInMeteorMethod is to be called within a Meteor method with Meteor running,
  // we can pass through callMeteorMethod to Meteor.apply.
  meteorContext.callMeteorMethod = (methodName, ...args) => Meteor.apply(methodName, args);

  return meteorContext;
}
