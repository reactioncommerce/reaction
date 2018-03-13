/**
 * @file Route Hook Methods - The Router.Hooks namespace provides a router-agnostic API for registering functions to be called either on specific routes or on every route. Read more about [Routing in Reaction](https://docs.reactioncommerce.com/reaction-docs/master/routing).
 *
 * @namespace Router.Hooks
 */

const Hooks = {
  _hooks: {
    onEnter: {},
    onExit: {}
  },

  _addHook(type, routeName, callback) {
    if (typeof this._hooks[type][routeName] === "undefined") {
      this._hooks[type][routeName] = [];
    }
    this._hooks[type][routeName].push(callback);
  },

  enter(callback) {
    if (Array.isArray(callback)) {
      callback.forEach((cb) => {
        this.onEnter(cb);
      });
    } else {
      this.onEnter(callback);
    }
  },

  leave(callback) {
    if (Array.isArray(callback)) {
      callback.forEach((cb) => {
        this.onExit(cb);
      });
    } else {
      return this.onExit(callback);
    }
  },

  /**
   * @method onEnter
   * @memberof Router.Hooks
   * @summary Register a hook on a specific route
   * Can be called as many times as needed to add more than one callback
   * @example // create a function to do something on the product detail page
function logSomeStuff() {
  console.log("We're arriving at the product page!");
}
// add that to the product detail page onEnter hook
Router.Hooks.onEnter("product", logSomeStuff);
   * @param  {String}   routeName Name of route
   * @param  {Function} callback  Callback method
   * @return {undefined}
   */
  onEnter(routeName, callback) {
    // if first argument is a function it's a global callback
    if (arguments.length === 1 && typeof routeName === "function") {
      const cb = routeName;
      return this._addHook("onEnter", "GLOBAL", cb);
    }
    // route-specific onEnter callback
    return this._addHook("onEnter", routeName, callback);
  },

  /**
   * @method onExit
   * @memberof Router.Hooks
   * @summary Register a hook on a specific route
   * Can be called as many times as needed to add more than one callback
   * @param  {String}   routeName Name of route
   * @param  {Function} callback  Callback method
   * @return {undefined}
   */
  onExit(routeName, callback) {
    // if first argument is a function it's a global callback
    if (arguments.length === 1 && typeof routeName === "function") {
      const cb = routeName;
      return this._addHook("onExit", "GLOBAL", cb);
    }
    // route-specific onExit callback
    return this._addHook("onExit", routeName, callback);
  },

  /**
   * @method get
   * @memberof Router.Hooks
   * @summary Get all registered hooks for a specific route
   * @param  {String} type Type of hook - `"onEnter"` or `"onExit"`
   * @param  {String} name Name of Route
   * @return {Array}  Array of hooks
   */
  get(type, name) {
    const group = this._hooks[type] || {};
    const callbacks = group[name];
    return (typeof callbacks !== "undefined" && !!callbacks.length) ? callbacks : [];
  },

  /**
   * @method run
   * @memberof Router.Hooks
   * @summary Run all registered hooks
   * @param  {String} type Type of hook - `"onEnter"` or `"onExit"`
   * @param  {String} name "GLOBAL" for all registered global hooks
   * @param  {Object} [context] Context object, optional, or `routeName`
   * @return {Array}  Array of hooks
   */
  run(type, name, context) {
    const callbacks = this.get(type, name);
    if (typeof callbacks !== "undefined" && !!callbacks.length) {
      return callbacks.forEach((callback) => callback(context));
    }
    return null;
  }
};

export default Hooks;
