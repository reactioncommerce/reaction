###
#  Blatant reuse of Meteor method hooks from
#  https://github.com/hitchcott/meteor-method-hooks
#  and
#  https://github.com/Workpop/meteor-method-hooks
###

MethodHooks = {}

###*
# A hook to be run before or after a method.
# @name Hook
# @function
# @return {*} The result of the method. Ignored for before hooks, passed as the methodResult to subsequent method hooks.
# You can mutate the return value in after hooks.
# @param {{result: *, error: *, arguments: Array, hooksProcessed: Number}} An options parameter that has the result and
# error from calling the method and the arguments used to call that method. `result` and `error` are null for before
# hooks, since the method has not yet been called. On the client, after hooks are called when the method returns from
# the server, but before the callback is invoked. `hooksProcessed` gives you the number of hooks processed so far,
# since previous hooks may have mutated the arguments.
#
# After hooks can change the result values. Use `hooksProcessed` to keep track of how many modifications have been
# made.
###

###*
# A collection of after hooks
# @type {Object.<String, [Hook]>} A mapping from method names to arrays of hooks
# @private
###

MethodHooks._afterHooks = {}

###*
# A collection of before hooks
# @type {Object.<String, [Hook]>} A mapping from method names to arrays of hooks
# @private
###

MethodHooks._beforeHooks = {}

###*
# The method handler definitions appropriate to the environment
###

MethodHooks._handlers = if Meteor.isClient then Meteor.connection._methodHandlers else Meteor.server.method_handlers

###*
# The original method handlers
# @type {Object.<String, Function>} Method handler mapping
# @private
###

MethodHooks._originalMethodHandlers = {}

###*
# Wrappers
# @type {Object.<String, Function>} A mapping from method names to method functions
# @private
###

MethodHooks._wrappers = {}

###*
# Initializes a new hook
# @param mapping {{}<String, [Hook]>} A place to store the mapping
# @param methodName {String} The name of the method
# @param hookFunction {function} The hook function
# @private
###

MethodHooks._initializeHook = (mapping, methodName, hookFunction) ->
  mapping[methodName] = mapping[methodName] or []
  mapping[methodName].push hookFunction
  # Initialize a wrapper for the given method name. Idempotent, it will not erase existing handlers.
  method = MethodHooks._handlers[methodName]
  # If no method is found, or a wrapper already exists, return
  if !method or MethodHooks._wrappers[methodName]
    return
  # Get a reference to the original handler
  MethodHooks._originalMethodHandlers[methodName] = method

  MethodHooks._wrappers[methodName] = ->
    # Get arguments you can mutate
    args = _.toArray(arguments)
    # Call the before hooks
    beforeHooks = MethodHooks._beforeHooks[methodName]
    _.each beforeHooks, (beforeHook, hooksProcessed) ->
      beforeHook.call this,
        result: undefined
        error: undefined
        arguments: args
        hooksProcessed: hooksProcessed
      return
    methodResult = undefined
    methodError = undefined
    # Call the main method body
    try
      methodResult = MethodHooks._originalMethodHandlers[methodName].apply(this, args)
    catch error
      methodError = error
    # Call after hooks, providing the result and the original arguments
    afterHooks = MethodHooks._afterHooks[methodName]
    _.each afterHooks, (afterHook, hooksProcessed) ->
      hookResult = afterHook.call(this,
        result: methodResult
        error: methodError
        arguments: args
        hooksProcessed: hooksProcessed)
      # If the after hook did not return a value and the methodResult is not undefined, warn and fix
      if _.isUndefined(hookResult) and !_.isUndefined(methodResult)
        Meteor._debug 'Expected the after hook to return a value.'
      else
        methodResult = hookResult
      return
    # If an error was thrown, throw it after the after hooks. Ought to include the correct stack information
    if methodError
      throw methodError
    # Return the method result, possibly modified by the after hook
    methodResult

  # Assign to a new handler
  MethodHooks._handlers[methodName] = MethodHooks._wrappers[methodName]
  return

###*
# Add a function to call before the specified method
# @param methodName {string}
# @param beforeFunction {Hook}
###

MethodHooks.before = (methodName, beforeFunction) ->
  MethodHooks._initializeHook MethodHooks._beforeHooks, methodName, beforeFunction
  return

###*
# Add a function to call after the specified method
# @param methodName {string}
# @param afterFunction {Hook}
###

MethodHooks.after = (methodName, afterFunction) ->
  MethodHooks._initializeHook MethodHooks._afterHooks, methodName, afterFunction
  return

###*
# Call the provided hook in values for the key'd method names
# @param dict {Object.<string, Hook>}
###

MethodHooks.beforeMethods = (dict) ->
  _.each dict, (v, k) ->
    MethodHooks.before k, v
    return
  return

###*
# Call the provided hook in values for the key'd method names
# @param dict {Object.<string, Hook>}
###

MethodHooks.afterMethods = (dict) ->
  _.each dict, (v, k) ->
    MethodHooks.after k, v
    return
  return
