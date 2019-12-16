import { createFactoryForSchema, Factory } from "@reactioncommerce/data-factory";

import {
  Catalog,
  CatalogProduct,
  CatalogProductOption,
  CatalogProductVariant
} from "../../src/core-services/catalog/simpleSchemas.js";

import {
  Cart,
  CartAddress,
  CartInvoice,
  CartItem,
  ShipmentQuote
} from "../../src/core-services/cart/simpleSchemas.js";

import {
  DiscountCodes as Discounts
} from "../../src/plugins/discount-codes/simpleSchemas.js";

import {
  extendInventorySchemas
} from "../../src/core-services/inventory/simpleSchemas.js";

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
} from "../../src/core-services/orders/simpleSchemas.js";

import {
  Account,
  AccountProfileAddress,
  Email,
  Group
} from "../../src/core-services/account/simpleSchemas.js";

import {
  Product,
  ProductVariant
} from "../../src/core-services/product/simpleSchemas.js";

import {
  Shop
} from "../../src/core-services/shop/simpleSchemas.js";

import {
  Tag
} from "../../src/core-services/tags/simpleSchemas.js";

import {
  TaxRates
} from "../../src/plugins/taxes-rates/simpleSchemas.js";

import {
  extendTaxesSchemas
} from "../../src/core-services/taxes/simpleSchemas.js";

import {
  EmailTemplates
} from "../../src/plugins/email-templates/simpleSchemas.js";

import {
  extendSimplePricingSchemas
} from "../../src/plugins/simple-pricing/simpleSchemas.js";

import { AddressValidationRule } from "../../src/plugins/address/simpleSchemas.js";

const schemasToAddToFactory = {
  Account,
  AccountProfileAddress,
  AddressValidationRule,
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
  Discounts,
  Email,
  EmailTemplates,
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
  Tag,
  TaxRates
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
