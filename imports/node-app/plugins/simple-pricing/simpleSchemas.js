import SimpleSchema from "simpl-schema";

/**
 * @name PriceRange
 * @type {SimpleSchema}
 * @memberof Schemas
 * @property {String} range, default value: `"0.00"`
 * @property {Number} min optional, default value: `0`
 * @property {Number} max optional, default value: `0`
 */
export const PriceRange = new SimpleSchema({
  range: {
    type: String,
    defaultValue: "0.00"
  },
  min: {
    type: Number,
    defaultValue: 0,
    optional: true
  },
  max: {
    type: Number,
    defaultValue: 0,
    optional: true
  }
});

const variantSchemaExtension = {
  pricing: {
    type: Object,
    blackbox: true
  }
};

/**
 * @summary Extend SimpleSchemas from other plugins
 * @param {Object} schemas SimpleSchema map from context
 * @return {undefined}
 */
export function extendSimplePricingSchemas(schemas) {
  const {
    CatalogProduct,
    CatalogProductOption,
    CatalogProductVariant,
    Product,
    ProductVariant
  } = schemas;

  Product.extend({
    price: {
      label: "Price",
      type: PriceRange
    }
  });

  ProductVariant.extend({
    compareAtPrice: {
      label: "Compare At Price",
      type: Number,
      optional: true,
      min: 0,
      defaultValue: 0.00
    },
    price: {
      label: "Price",
      type: Number,
      defaultValue: 0.00,
      min: 0,
      optional: true
    }
  });

  CatalogProduct.extend({
    pricing: {
      type: Object,
      blackbox: true
    }
  });

  // Extend the catalog variant database schemas
  CatalogProductVariant.extend(variantSchemaExtension);
  CatalogProductOption.extend(variantSchemaExtension);
}
