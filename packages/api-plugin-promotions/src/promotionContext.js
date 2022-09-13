import Logger from "@reactioncommerce/logger";

export const promotionContext = {
  triggers: {},
  actions: {},
  enhancers: [],

  /**
   * @summary Register a trigger function
   * @param {String} triggerKey The trigger key
   * @param {Function} handler The function to call when the trigger is fired
   * @returns {void}
   */
  registerTrigger(triggerKey, handler) {
    Logger.info("Register trigger: ", triggerKey);
    this.triggers[triggerKey] = handler;
  },

  /**
   * @summary Register an action handler
   * @param {String} actionKey The action key
   * @param {Function} handler The action handler
   * @returns {void}
   */
  registerAction(actionKey, handler) {
    Logger.info("Register action: ", actionKey);
    this.actions[actionKey] = handler;
  },

  /**
   * @summary Register an enhancer function
   * @param {Function|Array<Function>} enhancer The enhancer function to register
   * @returns {void}
   */
  registerEnhancer(enhancer) {
    Logger.info("Register enhancer: ", enhancer);
    if (Array.isArray(enhancer)) {
      this.enhancers = [...this.enhancers, ...enhancer];
    } else {
      this.enhancers.push(enhancer);
    }
  },

  /**
   * @summary Get a trigger function
   * @param {String} triggerKey - The trigger key
   * @returns {Function|undefined} The trigger function
   */
  getTrigger(triggerKey) {
    return this.triggers[triggerKey];
  },

  /**
   * @summary Get an action handler
   * @param {String} actionKey - The action key
   * @returns {Function|undefined} The action handler
   */
  getAction(actionKey) {
    return this.actions[actionKey];
  }
};
