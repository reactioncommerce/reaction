import { createFactoryForSchema, Factory } from "@reactioncommerce/data-factory";
// import * as coreSchemas from "/imports/collections/schemas";
/* core-services */
import * as catalogSchemas from "/imports/node-app/core-services/catalog/simpleSchemas.js";
import * as filesSchemas from "/imports/node-app/core-services/files/simpleSchemas.js";
import * as ordersSchemas from "/imports/node-app/core-services/orders/simpleSchemas.js";
import * as productSchemas from "/imports/node-app/core-services/product/simpleSchemas.js";
import * as shopSchemas from "/imports/node-app/core-services/shop/simpleSchemas.js";
import * as tagSchemas from "/imports/node-app/core-services/tags/simpleSchemas.js";
import * as taxesSchemas from "/imports/node-app/core-services/taxes/simpleSchemas.js";
/* plugins */
import * as navigationSchemas from "/imports/node-app/plugins/navigation/simpleSchemas.js";
import * as notificationsSchemas from "/imports/node-app/plugins/notifications/simpleSchemas.js";
import * as simpleInventorySchemas from "/imports/node-app/plugins/simple-inventory/simpleSchemas.js";
import * as simplePricingSchemas from "/imports/node-app/plugins/simple-pricing/simpleSchemas.js";

import * as taxSchemas from "/imports/plugins/core/taxes/lib/simpleSchemas";
// import * as templateClientSchemas from "/imports/plugins/core/templates/client/simpleSchemas";
// import * as templateServerSchemas from "/imports/plugins/core/templates/server/simpleSchemas";

// TODO This extending stuff is a workaround for now
/**
 * @property {Boolean} isBackorder required, Indicates when a product is currently backordered
 * @property {Boolean} isLowQuantity required, Indicates that the product quantity is too low
 * @property {Boolean} isSoldOut required, Indicates when the product quantity is zero
 */
catalogSchemas.CatalogProduct.extend({
  isBackorder: Boolean,
  isLowQuantity: Boolean,
  isSoldOut: Boolean
});

// Extend variants by adding a isSoldOut prop
const variantSchemaExtension = {
  isSoldOut: Boolean
};

// catalogSchemas.CatalogVariantSchema.extend(variantSchemaExtension);
// productSchemas.VariantBaseSchema.extend(variantSchemaExtension);

[
  catalogSchemas,
  filesSchemas,
  ordersSchemas,
  productSchemas,
  shopSchemas,
  tagSchemas,
  taxSchemas,
  taxesSchemas,
  navigationSchemas,
  notificationsSchemas,
  simpleInventorySchemas,
  simplePricingSchemas
].forEach((schemas) => {
  Object.keys(schemas).forEach((key) => {
    createFactoryForSchema(key, schemas[key]);
  });
});

export default Factory;
