export const promotionContext = {
  triggers: {},
  actions: {},
  registerTrigger(triggerKey, handler) {
    console.log("register trigger: ", triggerKey);
    this.triggers[triggerKey] = handler;
  },
  registerAction(actionKey, handler) {
    console.log("register action: ", actionKey);
    this.actions[actionKey] = handler;
  },
};
