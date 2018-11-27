/**
 * This is a temporary events solution on our path to
 * event streams and services. For now, some code relies
 * on events happening synchronously and we need it to
 * work in Fibers when running within Meteor.
 */

/**
 * @summary calls each function in an array with args, one at a time
 * @param {Function[]} funcs List of functions to call
 * @param {Array} args Arguments to pass to each function
 * @returns {undefined} Promise that resolves with undefined after all
 *   functions in the list have been called
 */
async function synchronousPromiseLoop(funcs, args) {
  const func = funcs.shift();
  await func(...args);
  if (funcs.length) {
    await synchronousPromiseLoop(funcs, args);
  }
}

class AppEvents {
  handlers = {};

  async emit(name, ...args) {
    if (!this.handlers[name]) return;

    // Can't use forEach or map because we want each func to wait
    // until the previous func promise resolves
    await synchronousPromiseLoop(this.handlers[name].slice(0), args);
  }

  on(name, func) {
    if (!this.handlers[name]) {
      this.handlers[name] = [];
    }

    this.handlers[name].push(func);
  }
}

export default new AppEvents();
