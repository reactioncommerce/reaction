import { createFactoryForSchema, Factory } from "@reactioncommerce/data-factory";
import * as coreSchemas from "/imports/collections/schemas";
import * as ordersSchemas from "/imports/plugins/core/orders/server/no-meteor/simpleSchemas";
import * as taxSchemas from "/imports/plugins/core/taxes/lib/simpleSchemas";

// TODO This extending stuff is a workaround for now
/**
 * @property {Boolean} isBackorder required, Indicates when a product is currently backordered
 * @property {Boolean} isLowQuantity required, Indicates that the product quantity is too low
 * @property {Boolean} isSoldOut required, Indicates when the product quantity is zero
 */
coreSchemas.CatalogProduct.extend({
  isBackorder: Boolean,
  isLowQuantity: Boolean,
  isSoldOut: Boolean
});

// Extend variants by adding a isSoldOut prop
const variantSchemaExtension = {
  isSoldOut: Boolean
};

coreSchemas.CatalogVariantSchema.extend(variantSchemaExtension);
coreSchemas.VariantBaseSchema.extend(variantSchemaExtension);

[
  coreSchemas,
  ordersSchemas,
  taxSchemas
].forEach((schemas) => {
  Object.keys(schemas).forEach((key) => {
    createFactoryForSchema(key, schemas[key]);
  });
});

export default Factory;
