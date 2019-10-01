import Logger from "@reactioncommerce/logger";

/**
 * This is a temporary events solution on our path to
 * event streams and services. For now, some code relies
 * on events happening synchronously and we need it to
 * work in Fibers when running within Meteor.
 */

/**
 * @summary calls each function in an array with args, one at a time
 * @param {String} name Event name
 * @param {Function[]} funcs List of functions to call
 * @param {Array} args Arguments to pass to each function
 * @returns {undefined} Promise that resolves with undefined after all
 *   functions in the list have been called
 */
async function synchronousPromiseLoop(name, funcs, args) {
  const func = funcs.shift();

  // One function failing should not prevent others from running,
  // so catch and log
  try {
    await func(...args);
  } catch (error) {
    Logger.error(`Error in "${name}" consumer`, error);
  }

  if (funcs.length) {
    await synchronousPromiseLoop(name, funcs, args);
  }
}

class AppEvents {
  handlers = {};
  stopped = false;

  resume() {
    this.stopped = false;
  }

  stop() {
    this.stopped = true;
  }

  async emit(name, ...args) {
    if (this.stopped || !this.handlers[name]) return;

    // Can't use forEach or map because we want each func to wait
    // until the previous func promise resolves
    await synchronousPromiseLoop(name, this.handlers[name].slice(0), args);
  }

  on(name, func) {
    if (!this.handlers[name]) {
      this.handlers[name] = [];
    }

    this.handlers[name].push(func);
  }
}

export default new AppEvents();
