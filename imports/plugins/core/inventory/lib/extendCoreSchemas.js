import {
  CatalogProduct,
  VariantBaseSchema,
  CatalogVariantSchema
} from "/imports/collections/schemas";

/**
 * @property {Boolean} isBackorder required, Indicates when a product is currently backordered
 * @property {Boolean} isLowQuantity required, Indicates that the product quantity is too low
 * @property {Boolean} isSoldOut required, Indicates when the product quantity is zero
 */
CatalogProduct.extend({
  isBackorder: Boolean,
  isLowQuantity: Boolean,
  isSoldOut: Boolean
});

// Extend variants by adding a isSoldOut prop
const variantSchemaExtension = {
  isSoldOut: Boolean
};

VariantBaseSchema.extend(variantSchemaExtension);
CatalogVariantSchema.extend(variantSchemaExtension);
