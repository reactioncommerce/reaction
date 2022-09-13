import SimpleSchema from "simpl-schema";
import { CartDiscount } from "./simpleSchemas.js";

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
    label: "Undiscounted Order Amount",
    optional: true
  }
});

/**
 * @summary extend cart schemas with discount info
 * @param {Object} context - Application context
 * @returns {Promise<void>} undefined
 */
async function extendCartSchemas(context) {
  const { simpleSchemas: { Cart, CartItem, Shipment, ShippingMethod, ShipmentQuote } } = context;
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

  ShippingMethod.extend({
    undiscountedRate: {
      type: Number,
      optional: true
    }
  });

  ShipmentQuote.extend({
    undiscountedRate: {
      type: Number,
      optional: true
    }
  });
}

/**
 * @summary extend order schemas with discount info
 * @param {Object} context - Application context
 * @returns {Promise<void>} undefined
 */
async function extendOrderSchemas(context) {
  const { simpleSchemas: { Order, OrderFulfillmentGroup, OrderItem, CommonOrder, SelectedFulfillmentOption } } = context;
  Order.extend({
    // this is here for backwards compatibility with old discounts
    discount: {
      type: Number,
      label: "Legacy Discount",
      optional: true
    },
    undiscountedAmount: {
      type: Number,
      label: "Undiscounted Amount",
      optional: true
    }
  });
  Order.extend({
    "discounts": {
      type: Array,
      label: "Order Discounts"
    },
    "discounts.$": {
      type: CartDiscount,
      label: "Order Discount"
    }
  });
  OrderItem.extend({
    "discounts": {
      type: Array,
      label: "Item Discounts"
    },
    "discounts.$": {
      type: CartDiscount,
      label: "Item Discount"
    },
    "subtotal.undiscountedAmount": {
      type: Number,
      optional: true
    }
  });

  CommonOrder.extend({
    "discounts": {
      type: Array,
      label: "Common Order Discounts"
    },
    "discounts.$": {
      type: CartDiscount,
      label: "Common Order Discount"
    }
  });

  OrderFulfillmentGroup.extend({
    "discounts": {
      type: Array
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

export default async function preStartupDiscounts(context) {
  await extendCartSchemas(context);
  await extendOrderSchemas(context);
}
