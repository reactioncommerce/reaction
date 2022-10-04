import SimpleSchema from "simpl-schema";
import _ from "lodash";

const PromotionsDeclaration = new SimpleSchema({
  "triggers": {
    type: Array
  },
  "triggers.$": {
    type: Object,
    blackbox: true
  },
  "actions": {
    type: Array,
    blackbox: true
  },
  "actions.$": {
    type: Object,
    blackbox: true
  },
  "enhancers": {
    type: Array,
    optional: true
  },
  "enhancers.$": {
    type: Function
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
  }
});

export const promotions = {
  triggers: [],
  actions: [],
  enhancers: [], // enhancers for promotion data,
  schemaExtensions: [],
  operators: {} // operators used for rule evaluations
};

/**
 * @summary aggregate various passed in pieces together
 * @param {Object} pluginPromotions - Extensions passed in via child plugins
 * @returns {undefined} undefined
 */
export function registerPluginHandlerForPromotions({ promotions: pluginPromotions }) {
  if (pluginPromotions) {
    const { triggers, actions, enhancers, schemaExtensions, operators } = pluginPromotions;
    if (triggers) {
      promotions.triggers = _.uniqBy(promotions.triggers.concat(triggers), "key");
    }
    if (actions) {
      promotions.actions = _.uniqBy(promotions.actions.concat(actions), "key");
    }
    if (enhancers) {
      promotions.enhancers = promotions.enhancers.concat(enhancers);
    }
    if (schemaExtensions) {
      promotions.schemaExtensions = promotions.schemaExtensions.concat(schemaExtensions);
    }
    if (operators) {
      promotions.operators = { ...promotions.operators, ...operators };
    }
  }
  PromotionsDeclaration.validate(promotions);
}
