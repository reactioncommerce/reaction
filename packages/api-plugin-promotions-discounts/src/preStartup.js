import SimpleSchema from "simpl-schema";
import { CartDiscount, ConditionRule } from "./simpleSchemas.js";

const discountSchema = new SimpleSchema({
  // this is here for backwards compatibility with old discounts
  discount: {
    type: Number,
    label: "Legacy Discount",
    optional: true,
    defaultValue: 0
  },
  undiscountedAmount: {
    type: Number,
    label: "UnDiscounted Order Amount",
    optional: true
  }
});

/**
 * @summary extend cart schemas with discount info
 * @param {Object} context - Application context
 * @returns {Promise<void>} undefined
 */
async function extendCartSchemas(context) {
  const { simpleSchemas: { Cart, CartItem, Shipment, ShippingMethod, ShipmentQuote, PromotionStackability } } = context;
  Cart.extend(discountSchema);
  Cart.extend({
    "discounts": {
      type: Array,
      defaultValue: [],
      optional: true
    },
    "discounts.$": {
      type: CartDiscount
    }
  });

  CartItem.extend({
    "discounts": {
      type: Array,
      defaultValue: [],
      optional: true
    },
    "discounts.$": {
      type: CartDiscount
    },
    "subtotal.undiscountedAmount": {
      type: Number,
      optional: true
    },
    "subtotal.discount": {
      type: Number,
      optional: true
    }
  });

  CartDiscount.extend({
    stackability: {
      type: PromotionStackability,
      optional: true
    }
  });

  Shipment.extend({
    "discounts": {
      type: Array,
      defaultValue: [],
      optional: true
    },
    "discounts.$": {
      type: CartDiscount
    }
  });

  ShipmentQuote.extend({
    "discounts": {
      type: Array,
      defaultValue: [],
      optional: true
    },
    "discounts.$": {
      type: CartDiscount
    },
    "undiscountedRate": {
      type: Number,
      optional: true
    },
    "discount": {
      type: Number,
      optional: true
    }
  });

  ShippingMethod.extend({
    undiscountedRate: {
      type: Number,
      optional: true
    },
    discount: {
      type: Number,
      optional: true
    },
    shippingPrice: {
      type: Number,
      defaultValue: 0
    }
  });
}

/**
 * @summary extend order schemas with discount info
 * @param {Object} context - Application context
 * @returns {Promise<void>} undefined
 */
async function extendOrderSchemas(context) {
  const { simpleSchemas: { Order, OrderFulfillmentGroup, OrderItem, CommonOrder, SelectedFulfillmentOption, CartPromotionItem } } = context;
  Order.extend({
    // this is here for backwards compatibility with old discounts
    discount: {
      type: Number,
      label: "Legacy Discount",
      optional: true
    },
    undiscountedAmount: {
      type: Number,
      label: "UnDiscounted Amount",
      optional: true
    }
  });
  Order.extend({
    "discounts": {
      type: Array,
      label: "Order Discounts",
      optional: true
    },
    "discounts.$": {
      type: CartDiscount,
      label: "Order Discount"
    }
  });

  Order.extend({
    "appliedPromotions": {
      type: Array,
      optional: true
    },
    "appliedPromotions.$": {
      type: CartPromotionItem
    }
  });

  OrderItem.extend({
    "discount": {
      type: Number,
      optional: true
    },
    "discounts": {
      type: Array,
      label: "Item Discounts",
      optional: true
    },
    "discounts.$": {
      type: CartDiscount,
      label: "Item Discount"
    },
    "undiscountedAmount": {
      type: Number,
      optional: true
    }
  });

  CommonOrder.extend({
    "discounts": {
      type: Array,
      label: "Common Order Discounts",
      optional: true
    },
    "discounts.$": {
      type: CartDiscount,
      label: "Common Order Discount"
    }
  });

  OrderFulfillmentGroup.extend({
    "discounts": {
      type: Array,
      optional: true
    },
    "discounts.$": {
      type: CartDiscount
    }
  });

  SelectedFulfillmentOption.extend({
    undiscountedRate: {
      type: Number,
      optional: true
    }
  });
}

/**
 * @summary Pre-startup function for api-plugin-promotions-discounts
 * @param {Object} context - Startup context
 * @returns {Promise<void>} undefined
 */
export default async function preStartupDiscounts(context) {
  await extendCartSchemas(context);
  await extendOrderSchemas(context);

  const { promotionOfferFacts, promotions: { allowOperators } } = context;

  const promotionFactKeys = Object.keys(promotionOfferFacts);

  ConditionRule.extend({
    fact: {
      allowedValues: ConditionRule.getAllowedValuesForKey("fact").concat(promotionFactKeys)
    },
    operator: {
      allowedValues: allowOperators
    }
  });
}
