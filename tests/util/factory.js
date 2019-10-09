import { createFactoryForSchema, Factory } from "@reactioncommerce/data-factory";

import {
  Catalog,
  CatalogProduct,
  CatalogProductOption,
  CatalogProductVariant
} from "/imports/node-app/core-services/catalog/simpleSchemas.js";

import {
  Cart,
  CartAddress,
  CartInvoice,
  CartItem,
  ShipmentQuote
} from "/imports/node-app/core-services/cart/simpleSchemas.js";

import {
  extendInventorySchemas
} from "/imports/node-app/core-services/inventory/simpleSchemas.js";

import {
  CommonOrder,
  CommonOrderItem,
  extendOrdersSchemas,
  Order,
  OrderAddress,
  OrderFulfillmentGroup,
  orderFulfillmentGroupInputSchema,
  orderInputSchema,
  OrderInvoice,
  OrderItem,
  orderItemInputSchema,
  Payment
} from "/imports/node-app/core-services/orders/simpleSchemas.js";

import {
  Account,
  AccountProfileAddress,
  Group
} from "/imports/node-app/core-services/account/simpleSchemas.js";

import {
  Product,
  ProductVariant
} from "/imports/node-app/core-services/product/simpleSchemas.js";

import {
  Shop
} from "/imports/node-app/core-services/shop/simpleSchemas.js";

import {
  Tag
} from "/imports/node-app/core-services/tags/simpleSchemas.js";

import {
  extendTaxesSchemas
} from "/imports/node-app/core-services/taxes/simpleSchemas.js";

import {
  extendSimplePricingSchemas
} from "/imports/node-app/plugins/simple-pricing/simpleSchemas.js";

const schemasToAddToFactory = {
  Account,
  AccountProfileAddress,
  Cart,
  CartAddress,
  CartInvoice,
  CartItem,
  Catalog,
  CatalogProduct,
  CatalogProductOption,
  CatalogProductVariant,
  CommonOrder,
  CommonOrderItem,
  Group,
  Order,
  OrderAddress,
  OrderFulfillmentGroup,
  orderFulfillmentGroupInputSchema,
  orderInputSchema,
  OrderInvoice,
  OrderItem,
  orderItemInputSchema,
  Payment,
  Product,
  ProductVariant,
  ShipmentQuote,
  Shop,
  Tag
};

// Extend before creating factories in case some of the added fields
// are required.
extendInventorySchemas(schemasToAddToFactory);
extendSimplePricingSchemas(schemasToAddToFactory);
extendTaxesSchemas(schemasToAddToFactory);
extendOrdersSchemas(schemasToAddToFactory);

// Adds each to `Factory` object. For example, `Factory.Cart`
// will be the factory that builds an object that matches the
// `Cart` schema.
Object.keys(schemasToAddToFactory).forEach((key) => {
  createFactoryForSchema(key, schemasToAddToFactory[key]);
});

export default Factory;
