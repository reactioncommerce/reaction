import _ from "lodash";
import { Action, Trigger, Promotion as PromotionSchema, Stackability, CartPromotionItem } from "./simpleSchemas.js";

/**
 * @summary apply all schema extensions to the Promotions schema
 * @param {Object} context - The application context
 * @returns {undefined} undefined
 */
function extendSchemas(context) {
  const { promotions: { schemaExtensions }, simpleSchemas: { Promotion } } = context;
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
  const { simpleSchemas: { Cart } } = context; // we get this here rather then importing it to get the extended version

  Cart.extend({
    "promotionsVersion": {
      type: Number,
      optional: true
    },
    "appliedPromotions": {
      type: Array,
      optional: true
    },
    "appliedPromotions.$": {
      type: CartPromotionItem
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
  const { actions: additionalActions, triggers: additionalTriggers, promotionTypes, stackabilities, allowOperators, operators } = context.promotions;
  const triggerKeys = _.map(additionalTriggers, "key");
  const actionKeys = _.map(additionalActions, "key");
  const promotionTypeKeys = Object.keys(promotionTypes);
  const stackabilityKeys = _.map(stackabilities, "key");
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

  PromotionSchema.extend({
    promotionType: {
      allowedValues: [...PromotionSchema.getAllowedValuesForKey("promotionType"), ...promotionTypeKeys]
    }
  });

  Stackability.extend({
    key: {
      allowedValues: [...Stackability.getAllowedValuesForKey("key"), ...stackabilityKeys]
    }
  });

  const newAddedOperatorKeys = Object.keys(operators);
  allowOperators.push(...newAddedOperatorKeys);
}
