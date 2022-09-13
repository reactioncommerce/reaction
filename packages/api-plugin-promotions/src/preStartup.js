import SimpleSchema from "simpl-schema";
import { Action, Trigger } from "./simpleSchemas.js";
import noop from "./actions/noop.js";

/**
 * @summary apply all schema extensions to the Promotions schema
 * @param {Object} context - The application context
 * @returns {undefined} undefined
 */
function extendSchemas(context) {
  const {
    promotions: { schemaExtensions },
    simpleSchemas: { Promotions }
  } = context;
  schemaExtensions.forEach((extension) => {
    Promotions.extend(extension);
  });
}

/**
 * @summary extend the cart schema
 * @param {Object} context - The application context
 * @returns {Object} the extended schema
 */
function extendCartSchema(context) {
  const { simpleSchemas: { Cart, Promotion } } = context; // we get this here rather than importing it to get the extended version
  const CartWarning = new SimpleSchema({
    promotion: {
      type: Promotion
    },
    rejectionReason: {
      type: String,
      allowedValues: ["cannot-be-combined", "expired"]
    }
  });
  const PromotionUpdateRecord = new SimpleSchema({
    "updatedAt": Date,
    "promotionsAdded": {
      type: Array
    },
    "promotionsAdded.$": {
      type: Promotion
    },
    "promotionsRemoved": {
      type: Array
    },
    "promotionsRemoved.$": {
      type: Promotion
    }
  });

  Cart.extend({
    "promotionHistory": {
      type: Array,
      optional: true
    },
    "promotionHistory.$": {
      type: PromotionUpdateRecord
    },
    "appliedPromotions": {
      type: Array,
      optional: true
    },
    "appliedPromotions.$": {
      type: Promotion
    },
    "promotionMessages": {
      type: Array,
      optional: true
    },
    "promotionMessages.$": {
      type: CartWarning
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
  context.promotionContext.registerAction("noop", noop);

  extendSchemas(context);
  extendCartSchema(context);

  const { actions: additionalActions, triggers: additionalTriggers } = context.promotions;
  Action.extend({
    actionKey: {
      allowedValues: [...Action.getAllowedValuesForKey("actionKey"), ...additionalActions]
    }
  });

  Trigger.extend({
    triggerKey: {
      allowedValues: [...Trigger.getAllowedValuesForKey("triggerKey"), ...additionalTriggers]
    }
  });
}
