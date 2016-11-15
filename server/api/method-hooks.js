import _ from "lodash";
import { Meteor } from "meteor/meteor";

/*
 *  Blatant reuse of Meteor method hooks from
 *  @see https://github.com/hitchcott/meteor-method-hooks
 *  @see https://github.com/Workpop/meteor-method-hooks
 */
export const MethodHooks = {};

/**
 * A hook to be run before or after a method.
 * @name Hook
 * @function
 * @return {*} The result of the method. Ignored for before hooks, passed as the methodResult to subsequent method hooks.
 * You can mutate the return value in after hooks.
 * @param {{result: *, error: *, arguments: Array, hooksProcessed: Number}} An options parameter that has the result and
 * error from calling the method and the arguments used to call that method. `result` and `error` are null for before
 * hooks, since the method has not yet been called. On the client, after hooks are called when the method returns from
 * the server, but before the callback is invoked. `hooksProcessed` gives you the number of hooks processed so far,
 * since previous hooks may have mutated the arguments.
 *
 * After hooks can change the result values. Use `hooksProcessed` to keep track of how many modifications have been
 * made.
 */

/**
 * A collection of after hooks
 * @type {Object.<String, [Hook]>} A mapping from method names to arrays of hooks
 * @private
 */
MethodHooks._afterHooks = {};

/**
 * A collection of before hooks
 * @type {Object.<String, [Hook]>} A mapping from method names to arrays of hooks
 * @private
 */
MethodHooks._beforeHooks = {};

/**
 * handlers
 * The method handler definitions appropriate to the environment
 */
MethodHooks._handlers = Meteor.isClient ? Meteor.connection._methodHandlers :
  Meteor.server.method_handlers;

/**
 * The original method handlers
 * @type {Object.<String, Function>} Method handler mapping
 * @private
 */
MethodHooks._originalMethodHandlers = {};

/**
 * Wrappers
 * @type {Object.<String, Function>} A mapping from method names to method functions
 * @private
 */
MethodHooks._wrappers = {};

/**
 *  initializeHook
 * @summary Initializes a new hook
 * @param {String} mapping - map hook: a is  place to store the mapping
 * @param {String} methodName - The name of the method
 * @param {Function} hookFunction - The hook function
 * @private
 * @return {String} - returns transformed data
 */
MethodHooks._initializeHook = function (mapping, methodName, hookFunction) {
  mapping[methodName] = mapping[methodName] || [];
  mapping[methodName].push(hookFunction);

  // Initialize a wrapper for the given method name. Idempotent, it will not erase existing handlers.
  const method = MethodHooks._handlers[methodName];
  // If no method is found, or a wrapper already exists, return
  if (!method || MethodHooks._wrappers[methodName]) {
    return;
  }

  // Get a reference to the original handler
  MethodHooks._originalMethodHandlers[methodName] = method;

  MethodHooks._wrappers[methodName] = function () {
    // Get arguments you can mutate
    const args = _.toArray(arguments);
    let beforeResult;
    // Call the before hooks

    const beforeHooks = MethodHooks._beforeHooks[methodName];
    _.each(beforeHooks, (beforeHook, hooksProcessed) => {
      beforeResult = beforeHook.call(this, {
        result: undefined,
        error: undefined,
        arguments: args,
        hooksProcessed: hooksProcessed
      });

      if (beforeResult === false) {
        return false;
      }
    });

    if (beforeResult === false) {
      return false;
    }
    let methodResult;
    let methodError;

    // Call the main method body
    // check(args, Match.Any);
    try {
      methodResult = MethodHooks._originalMethodHandlers[methodName].apply(this, args);
    } catch (error) {
      methodError = error;
    }

    // Call after hooks, providing the result and the original arguments
    const afterHooks = MethodHooks._afterHooks[methodName];
    _.each(afterHooks, (afterHook, hooksProcessed) => {
      const hookResult = afterHook.call(this, {
        result: methodResult,
        error: methodError,
        arguments: args,
        hooksProcessed: hooksProcessed
      });
      // If the after hook did not return a value and the methodResult is not undefined, warn and fix
      if (_.isUndefined(hookResult) && !_.isUndefined(methodResult)) {
        Meteor._debug("Expected the after hook to return a value.");
      } else {
        methodResult = hookResult;
      }
    });

    // If an error was thrown, throw it after the after hooks. Ought to include the correct stack information
    if (methodError) {
      throw methodError;
    }

    // Return the method result, possibly modified by the after hook
    return methodResult;
  };

  // Assign to a new handler
  MethodHooks._handlers[methodName] = MethodHooks._wrappers[
    methodName];
};

/**
 * Reaction MethodHooks before
 * @summary Add a function to call before the specified method
 * @param {String} methodName - methodName
 * @param {String} beforeFunction - beforeFunction
 * @return {String} - returns transformed data
 */
MethodHooks.before = function (methodName, beforeFunction) {
  MethodHooks._initializeHook(MethodHooks._beforeHooks,
    methodName, beforeFunction);
};

/**
 * MethodHooks.after
 * Add a function to call after the specified method
 * @param {String} methodName - methodName
 * @param {String} afterFunction - afterFunction
 * @return {String} - returns transformed data
 */
MethodHooks.after = function (methodName, afterFunction) {
  MethodHooks._initializeHook(MethodHooks._afterHooks,
    methodName, afterFunction);
};

/**
 * MethodHooks.beforeMethods
 * Call the provided hook in values for the key'd method names
 * @param {Object.<string, Hook>} dict - dict
 * @return {String} - returns transformed data
 */
MethodHooks.beforeMethods = function (dict) {
  _.each(dict, function (v, k) {
    MethodHooks.before(k, v);
  });
};

/**
 * Call the provided hook in values for the key'd method names
 * @param {Object.<string, Hook>} dict - dict
 * @return {String} - returns transformed data
 */
MethodHooks.afterMethods = function (dict) {
  _.each(dict, function (v, k) {
    MethodHooks.after(k, v);
  });
};
