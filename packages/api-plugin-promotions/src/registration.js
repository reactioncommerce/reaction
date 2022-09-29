import SimpleSchema from "simpl-schema";

const PromotionsDeclaration = new SimpleSchema({
  "triggers": {
    type: Array
  },
  "triggers.$": {
    type: String
  },
  "actions": {
    type: Array
  },
  "actions.$": {
    type: String
  },
  "schemaExtensions": {
    type: Array
  },
  "schemaExtensions.$": {
    type: Object,
    blackbox: true
  },
  "operators": {
    type: Object,
    blackbox: true
  },
  "methods": {
    type: Object,
    blackbox: true
  },
  "enhancers": {
    type: Array,
    optional: true
  },
  "enhancers.$": {
    type: Function,
  },
  "triggerHandlers": {
    type: Object,
    blackbox: true
  },
  "actionHandlers": {
    type: Object,
    blackbox: true
  },
});

export const promotions = {
  triggers: [],
  actions: [],
  enhancers: [], // enhancers for promotion data,
  schemaExtensions: [],
  operators: {}, // operators used for rule evaluations
  methods: {}, // discount calculation methods
  triggerHandlers: {}, // trigger handlers
  actionHandlers: {} // action handlers
};

/**
 * @summary aggregate various passed in pieces together
 * @param {Object} pluginPromotions - Extensions passed in via child plugins
 * @returns {undefined} undefined
 */
export function registerPluginHandlerForPromotions({ promotions: pluginPromotions }) {
  if (pluginPromotions) {
    console.log("Promotion plugin: ", pluginPromotions);
    const { triggers, actions, enhancers, triggerHandlers, actionHandlers, schemaExtensions, operators, methods } = pluginPromotions;
    if (triggers) {
      promotions.triggers = promotions.triggers.concat(triggers);
    }
    if (actions) {
      promotions.actions = promotions.actions.concat(actions);
    }
    if (enhancers) {
      promotions.enhancers = promotions.enhancers.concat(enhancers);
    }
    if (triggerHandlers) {
      promotions.triggerHandlers = { ...promotions.triggerHandlers, ...triggerHandlers };
    }
    if (actionHandlers) {
      promotions.actionHandlers = { ...promotions.actionHandlers, ...actionHandlers };
    }
    if (schemaExtensions) {
      promotions.schemaExtensions = promotions.schemaExtensions.concat(schemaExtensions);
    }
    if (operators) {
      promotions.operators = { ...promotions.operators, ...operators };
    }
    if (methods) {
      promotions.methods = { ...promotions.methods, ...methods };
    }
  }
  PromotionsDeclaration.validate(promotions);
}
