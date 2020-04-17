import SimpleSchema from "simpl-schema";

export const Taxes = new SimpleSchema({
  _id: String,
  /**
   * Custom key/value data that you need to store.
   * You'll need to extend GraphQL schemas if you
   * want to expose any of this data through the API.
   */
  customFields: {
    type: Object,
    blackbox: true,
    optional: true
  },
  jurisdictionId: {
    type: String,
    optional: true
  },
  sourcing: {
    type: String,
    allowedValues: ["destination", "origin"]
  },
  tax: {
    type: Number,
    min: 0
  },
  taxableAmount: {
    type: Number,
    min: 0
  },
  taxName: String,
  taxRate: {
    type: Number,
    min: 0
  }
});

export const TaxSummary = new SimpleSchema({
  calculatedAt: Date,
  calculatedByTaxServiceName: {
    type: String,
    optional: true
  },
  /**
   * Custom key/value data that you need to store.
   * You'll need to extend GraphQL schemas if you
   * want to expose any of this data through the API.
   */
  customFields: {
    type: Object,
    blackbox: true,
    optional: true
  },
  referenceId: {
    type: String,
    optional: true
  },
  tax: {
    type: Number,
    min: 0
  },
  taxableAmount: {
    type: Number,
    min: 0
  },
  taxes: [Taxes]
});

export const TaxServiceItemTax = new SimpleSchema({
  /**
   * Custom key/value data that you need to store.
   * You'll need to extend GraphQL schemas if you
   * want to expose any of this data through the API.
   */
  customFields: {
    type: Object,
    blackbox: true,
    optional: true
  },
  itemId: String,
  tax: {
    type: Number,
    min: 0
  },
  taxableAmount: {
    type: Number,
    min: 0
  },
  taxes: [Taxes]
});

export const TaxServiceResult = new SimpleSchema({
  itemTaxes: [TaxServiceItemTax],
  taxSummary: TaxSummary
});

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

/**
 * @summary Extend schemas before startup
 * @param {Object} schemas SimpleSchema map
 * @returns {undefined}
 */
export function extendTaxesSchemas(schemas) {
  const {
    Cart,
    CartItem,
    CatalogProductOption,
    CatalogProductVariant,
    OrderFulfillmentGroup,
    OrderItem,
    ProductVariant
  } = schemas;

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
    /**
     * Custom key/value data that you need to store.
     * You'll need to extend GraphQL schemas if you
     * want to expose any of this data through the API.
     */
    "customTaxFields": {
      type: Object,
      blackbox: true,
      optional: true
    },
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
    /**
     * Custom key/value data that you need to store.
     * You'll need to extend GraphQL schemas if you
     * want to expose any of this data through the API.
     */
    "customTaxFields": {
      type: Object,
      blackbox: true,
      optional: true
    },
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

  const productVariantSchemaExtension = {
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
  };

  // Extend the catalog variant database schemas
  CatalogProductVariant.extend(variantSchemaExtension);
  CatalogProductOption.extend(variantSchemaExtension);
  ProductVariant.extend(productVariantSchemaExtension);
}
