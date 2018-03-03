import { Meteor } from "meteor/meteor";
import { DDPCommon } from "meteor/ddp-common";

/**
 * Applies args to a Meteor method with a GrapQL context.
 * @param {Object} context - A GraphQL context.
 * @param {String} name - The Meteor method name.
 * @param {Array} args - an array of Meteor method args.
 * @param {Function} asynCallback - An async callback for the Meteor method.
 * @return {Object} The result of the Meteor method call.
 */
export const applyWithContext = (context, name, args, asyncCallback) => {
  const userId = context.user._id;

  const invocation = new DDPCommon.MethodInvocation({
    isSimulation: false,
    userId,
    setUserId: () => {},
    unblock: () => {},
    connection: null,
    randomSeed: null
  });

  DDP._CurrentInvocation.withValue(invocation, () => {
    if (asyncCallback) {
      Meteor.apply(name, args, {}, asyncCallback);
    } else {
      return Meteor.apply(name, args);
    }
  });
};
