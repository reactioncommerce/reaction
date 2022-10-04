import _ from "lodash";
import { Action, Trigger } from "./simpleSchemas.js";

/**
 * @summary apply all schema extensions to the Promotions schema
 * @param {Object} context - The application context
 * @returns {undefined} undefined
 */
function extendSchemas(context) {
  const {
    promotions: { schemaExtensions },
    simpleSchemas: { Promotion }
  } = context;
  schemaExtensions.forEach((extension) => {
    Promotion.extend(extension);
  });
}

/**
 * @summary extend the cart schema
 * @param {Object} context - The application context
 * @returns {Object} the extended schema
 */
function extendCartSchema(context) {
  const {
    simpleSchemas: { Cart, Promotion }
  } = context; // we get this here rather than importing it to get the extended version

  Cart.extend({
    "appliedPromotions": {
      type: Array,
      optional: true
    },
    "appliedPromotions.$": {
      type: Promotion
    }
  });
  return Cart;
}

/**
 * @summary extend the cart schema to add promotions
 * @param {Object} context - The application context
 * @returns {undefined} undefined
 */
export default function preStartupPromotions(context) {
  extendSchemas(context);
  extendCartSchema(context);

  const { actions: additionalActions, triggers: additionalTriggers } = context.promotions;
  const triggerKeys = _.map(additionalTriggers, "key");
  const actionKeys = _.map(additionalActions, "key");
  Action.extend({
    actionKey: {
      allowedValues: [...Action.getAllowedValuesForKey("actionKey"), ...actionKeys]
    }
  });

  Trigger.extend({
    triggerKey: {
      allowedValues: [...Trigger.getAllowedValuesForKey("triggerKey"), ...triggerKeys]
    }
  });
}
