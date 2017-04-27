
/**
 * Route Hook Methods
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

  onEnter(routeName, callback) {
    // global onEnter callback
    if (arguments.length === 1 && typeof arguments[0] === "function") {
      const cb = routeName;
      return this._addHook("onEnter", "GLOBAL", cb);
    }
    // route-specific onEnter callback
    return this._addHook("onEnter", routeName, callback);
  },

  onExit(routeName, callback) {
    // global onExit callback
    if (arguments.length === 1 && typeof arguments[0] === "function") {
      const cb = routeName;
      return this._addHook("onExit", "GLOBAL", cb);
    }
    // route-specific onExit callback
    return this._addHook("onExit", routeName, callback);
  },

  get(type, name) {
    const group = this._hooks[type] || {};
    const callbacks = group[name];
    return (typeof callbacks !== "undefined" && !!callbacks.length) ? callbacks : [];
  },

  run(type, name, constant) {
    const callbacks = this.get(type, name);
    if (typeof callbacks !== "undefined" && !!callbacks.length) {
      return callbacks.forEach((callback) => {
        return callback(constant);
      });
    }
    return null;
  }
};

export default Hooks;
