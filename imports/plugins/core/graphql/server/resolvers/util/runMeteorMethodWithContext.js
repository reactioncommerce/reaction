import { DDP } from "meteor/ddp";
import { DDPCommon } from "meteor/ddp-common";
import { Meteor } from "meteor/meteor";

/**
 * Applies args to a Meteor method with a GraphQL context.
 * @param {Object} context - A GraphQL context.
 * @param {String} name - The Meteor method name.
 * @param {Array} args - an array of Meteor method args.
 * @return {any} The result of the Meteor method call.
 */
export default function runMeteorMethodWithContext(context, name, args) {
  const userId = context && context.user && context.user._id;

  const invocation = new DDPCommon.MethodInvocation({
    isSimulation: false,
    userId,
    setUserId: () => {},
    unblock: () => {},
    connection: null,
    randomSeed: null
  });

  return DDP._CurrentInvocation.withValue(invocation, () => Meteor.apply(name, args));
}
