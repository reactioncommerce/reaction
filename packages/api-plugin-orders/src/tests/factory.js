import { createFactoryForSchema, Factory } from "@reactioncommerce/data-factory";
import {
  Catalog,
  CatalogProduct,
  CatalogProductVariant
} from "@reactioncommerce/api-plugin-catalogs/src/simpleSchemas.js";

import {
  Shop
} from "@reactioncommerce/api-plugin-shops/src/simpleSchemas.js";

import {
  CommonOrder,
  CommonOrderItem,
  Order,
  OrderAddress,
  OrderFulfillmentGroup,
  orderFulfillmentGroupInputSchema,
  orderInputSchema,
  OrderInvoice,
  OrderItem,
  orderItemInputSchema,
  Payment
} from "../simpleSchemas.js";

const schemasToAddToFactory = {
  Catalog,
  CatalogProduct,
  CatalogProductVariant,
  CommonOrder,
  CommonOrderItem,
  Order,
  OrderAddress,
  OrderFulfillmentGroup,
  orderFulfillmentGroupInputSchema,
  orderInputSchema,
  OrderInvoice,
  OrderItem,
  orderItemInputSchema,
  Payment,
  Shop
};

// Adds each to `Factory` object. For example, `Factory.Cart`
// will be the factory that builds an object that matches the
// `Cart` schema.
Object.keys(schemasToAddToFactory).forEach((key) => {
  createFactoryForSchema(key, schemasToAddToFactory[key]);
});

export default Factory;
