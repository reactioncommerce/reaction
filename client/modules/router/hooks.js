
/**
 * Route Hook Methods
 */
const Hooks = {
  _hooks: {
    onEnter: [],
    onExit: []
  },

  _addHook(type, routeName, callback) {
    if (typeof this._hooks[type][routeName] === "undefined") {
      this._hooks[type][routeName] = [];
    }
    this._hooks[type][routeName].push(callback);
  },

  onEnter(routeName, callback) {
    // global onEnter callback
    if (arguments.length === 1 && typeof arguments[0] === "function") {
      return this._addHook("onEnter", "GLOBAL", callback);
    }
    // route-specific onEnter callback
    return this._addHook("onEnter", routeName, callback);
  },

  onExit(routeName, callback) {
    // global onExit callback
    if (arguments.length === 1 && typeof arguments[0] === "function") {
      return this._addHook("onExit", "GLOBAL", callback);
    }
    // route-specific onExit callback
    return this._addHook("onExit", routeName, callback);
  },

  run(type, name, constant) {
    const group = this._hooks[type];
    const callbacks = group[name];
    // if the hook exists and contains callbacks to run
    if (typeof callbacks !== "undefined" && !!callbacks.length) {
      return callbacks.forEach((callback) => {
        return callback(constant);
      });
    }
    return null;
  }
};

export default Hooks;
