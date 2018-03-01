import _ from "lodash";
import { Meteor } from "meteor/meteor";

/**
 * @file Callback hooks to alter the behavior of common operations or trigger other things.
 *
 *
 * @namespace Hooks.Events
 */
const Hooks = {};
Hooks.Events = {};


/**
 * @method add
 * @summary Add a callback function to a hook
 * @memberof Hooks.Events
 * @example Hooks.Events.add("afterAccountsRemove", callback)
 * @param {String} name - The name of the hook
 * @param {Function} callback - The callback function
 * @return {Array} array of the currently defined hooks
 */
Hooks.Events.add = (name, callback) => {
  // if callback array doesn't exist yet, initialize it
  if (typeof Hooks.Events[name] === "undefined") {
    Hooks.Events[name] = [];
  }
  return Hooks.Events[name].push(callback);
};


/**
 * @method remove
 * @summary Remove a callback from a hook
 * @memberof Hooks.Events
 * @param {String} name - The name of the hook
 * @param {String} callbackName - The name of the function to remove
 * @return {Array} array of remaining callbacks
 */
Hooks.Events.remove = (name, callbackName) => {
  Hooks.Events[name] = _.reject(Hooks.Events[name], (callback) => callback.name === callbackName);

  return Hooks.Events;
};


/**
 * @method run
 * @summary Successively run all of a hook's callbacks on an item
 * @memberof Hooks.Events
 * @example Hooks.Events.run("beforeCoreInit");
 * @param {String} name - The name of the hook
 * @param {Object} item - The object, modifier, etc. on which to run the callbacks
 * @param {Object} [constant] - An optional constant that will be passed along to each callback
 * @return {Object} Returns the item after it has been through all callbacks for this hook
 */
Hooks.Events.run = (name, item, constant) => {
  const callbacks = Hooks.Events[name];

  // if the hook exists, and contains callbacks to run
  if (typeof callbacks !== "undefined" && !!callbacks.length) {
    return callbacks.reduce((result, callback) => callback(result, constant), item);
  }
  return item;
};


/**
 * @method runAsync
 * @summary Successively run all of a hook's callbacks on an item, in async mode (only works on server)
 * @memberof Hooks.Events
 * @param {String} name - The name of the hook
 * @param {Object} item - The object, modifier, etc. on which to run the callbacks
 * @param {Object} [constant] - An optional constant that will be passed along to each callback
 * @return {Object} Returns the item after it has been through all callbacks for this hook
 */
Hooks.Events.runAsync = (name, item, constant) => {
  const callbacks = Hooks.Events[name];

  if (Meteor.isServer && typeof callbacks !== "undefined" && !!callbacks.length) {
    // use defer to avoid holding up client
    Meteor.defer(() => {
      // run all async server callbacks successively on object
      callbacks.forEach((callback) => {
        callback(item, constant);
      });
    });
  }
  return item;
};


export default Hooks;
