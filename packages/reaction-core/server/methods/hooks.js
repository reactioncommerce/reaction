/**
* Method Hooks
*/


/*
*  Blatant reuse of Meteor method hooks from
*  https://github.com/hitchcott/meteor-method-hooks
*  and
*  https://github.com/Workpop/meteor-method-hooks
*/


var MethodHooks;

MethodHooks = {};


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
 * The method handler definitions appropriate to the environment
 */

MethodHooks._handlers = Meteor.isClient ? Meteor.connection._methodHandlers : Meteor.server.method_handlers;


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
 * Initializes a new hook
 * @param mapping {{}<String, [Hook]>} A place to store the mapping
 * @param methodName {String} The name of the method
 * @param hookFunction {function} The hook function
 * @private
 */

MethodHooks._initializeHook = function(mapping, methodName, hookFunction) {
  var method;
  mapping[methodName] = mapping[methodName] || [];
  mapping[methodName].push(hookFunction);
  method = MethodHooks._handlers[methodName];
  if (!method || MethodHooks._wrappers[methodName]) {
    return;
  }
  MethodHooks._originalMethodHandlers[methodName] = method;
  MethodHooks._wrappers[methodName] = function() {
    var afterHooks, args, beforeHooks, error, methodError, methodResult;
    args = _.toArray(arguments);
    beforeHooks = MethodHooks._beforeHooks[methodName];
    _.each(beforeHooks, function(beforeHook, hooksProcessed) {
      beforeHook.call(this, {
        result: void 0,
        error: void 0,
        "arguments": args,
        hooksProcessed: hooksProcessed
      });
    });
    methodResult = void 0;
    methodError = void 0;
    try {
      methodResult = MethodHooks._originalMethodHandlers[methodName].apply(this, args);
    } catch (_error) {
      error = _error;
      methodError = error;
    }
    afterHooks = MethodHooks._afterHooks[methodName];
    _.each(afterHooks, function(afterHook, hooksProcessed) {
      var hookResult;
      hookResult = afterHook.call(this, {
        result: methodResult,
        error: methodError,
        "arguments": args,
        hooksProcessed: hooksProcessed
      });
      if (_.isUndefined(hookResult) && !_.isUndefined(methodResult)) {
        Meteor._debug('Expected the after hook to return a value.');
      } else {
        methodResult = hookResult;
      }
    });
    if (methodError) {
      throw methodError;
    }
    return methodResult;
  };
  MethodHooks._handlers[methodName] = MethodHooks._wrappers[methodName];
};


/**
 * Add a function to call before the specified method
 * @param methodName {string}
 * @param beforeFunction {Hook}
 */

MethodHooks.before = function(methodName, beforeFunction) {
  MethodHooks._initializeHook(MethodHooks._beforeHooks, methodName, beforeFunction);
};


/**
 * Add a function to call after the specified method
 * @param methodName {string}
 * @param afterFunction {Hook}
 */

MethodHooks.after = function(methodName, afterFunction) {
  MethodHooks._initializeHook(MethodHooks._afterHooks, methodName, afterFunction);
};


/**
 * Call the provided hook in values for the key'd method names
 * @param dict {Object.<string, Hook>}
 */

MethodHooks.beforeMethods = function(dict) {
  _.each(dict, function(v, k) {
    MethodHooks.before(k, v);
  });
};


/**
 * Call the provided hook in values for the key'd method names
 * @param dict {Object.<string, Hook>}
 */

MethodHooks.afterMethods = function(dict) {
  _.each(dict, function(v, k) {
    MethodHooks.after(k, v);
  });
};
