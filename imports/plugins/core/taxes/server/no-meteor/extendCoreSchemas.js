import { Cart, CartItem, OrderFulfillmentGroup, OrderItem, ProductVariant } from "/imports/collections/schemas";
import { CartTaxSummary, Taxes, TaxSummary } from "./simpleSchemas";

Cart.extend({
  taxSummary: {
    type: CartTaxSummary,
    optional: true
  }
});

OrderFulfillmentGroup.extend({
  taxSummary: TaxSummary
});

CartItem.extend({
  "isTaxable": Boolean,
  // For a cart item, `tax` will be `null` until there is enough information to calculate it,
  // or whenever no tax service is active for the shop.
  "tax": {
    type: Number,
    optional: true
  },
  // For a cart item, `taxableAmount` will be `null` until there is enough information to calculate it,
  // or whenever no tax service is active for the shop.
  "taxableAmount": {
    type: Number,
    optional: true
  },
  "taxCode": {
    type: String,
    optional: true
  },
  "taxes": {
    type: Array,
    optional: true
  },
  "taxes.$": Taxes
});

OrderItem.extend({
  "isTaxable": Boolean,
  "tax": Number,
  "taxableAmount": Number,
  "taxCode": {
    type: String,
    optional: true
  },
  "taxes": {
    type: Array,
    optional: true
  },
  "taxes.$": Taxes
});

ProductVariant.extend({
  isTaxable: Boolean,
  taxCode: {
    type: String,
    optional: true
  },
  taxDescription: {
    type: String,
    optional: true
  }
});
