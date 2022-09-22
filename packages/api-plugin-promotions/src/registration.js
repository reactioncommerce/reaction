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
  }
});

export const promotions = {
  triggers: [],
  actions: [],
  schemaExtensions: [],
  operators: {}, // operators used for rule evaluations
  methods: {} // discount calculation methods
};

/**
 * @summary aggregate various passed in pieces together
 * @param {Object} pluginPromotions - Extensions passed in via child plugins
 * @returns {undefined} undefined
 */
export function registerPluginHandlerForPromotions({ promotions: pluginPromotions }) {
  if (pluginPromotions) {
    const { triggers, actions, schemaExtensions, operators, methods } = pluginPromotions;
    if (triggers) {
      promotions.triggers = promotions.triggers.concat(triggers);
    }
    if (actions) {
      promotions.actions = promotions.actions.concat(actions);
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

