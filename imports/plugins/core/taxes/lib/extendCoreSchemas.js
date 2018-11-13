import {
  Cart,
  CartItem,
  CatalogVariantSchema,
  OrderFulfillmentGroup,
  OrderItem,
  ProductVariant,
  VariantBaseSchema
} from "/imports/collections/schemas";
import { Taxes, TaxSummary } from "./simpleSchemas";

Cart.extend({
  taxSummary: {
    type: TaxSummary,
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
  isTaxable: {
    type: Boolean,
    optional: true
  },
  taxCode: {
    type: String,
    optional: true
  },
  taxDescription: {
    type: String,
    optional: true
  }
});

// Extend the catalog variant database schemas
const variantSchemaExtension = {
  isTaxable: Boolean,
  taxCode: {
    type: String,
    optional: true
  },
  taxDescription: {
    type: String,
    optional: true
  }
};

VariantBaseSchema.extend(variantSchemaExtension);
CatalogVariantSchema.extend(variantSchemaExtension);
