import { createFactoryForSchema, Factory } from "@reactioncommerce/data-factory";

import {
  Account,
  AccountProfileAddress,
  Email,
  Group
} from "@reactioncommerce/api-plugin-accounts/src/simpleSchemas.js";

import {
  AddressValidationRule
} from "@reactioncommerce/api-plugin-address-validation/src/simpleSchemas.js";

import {
  Cart,
  CartAddress,
  CartInvoice,
  CartItem,
  Shipment,
  ShippingMethod,
  ShipmentQuote
} from "@reactioncommerce/api-plugin-carts/src/simpleSchemas.js";

import {
  Catalog,
  CatalogProduct,
  CatalogProductOption,
  CatalogProductVariant
} from "@reactioncommerce/api-plugin-catalogs/src/simpleSchemas.js";

import {
  EmailTemplates
} from "@reactioncommerce/api-plugin-email-templates/src/simpleSchemas.js";

import {
  extendInventorySchemas
} from "@reactioncommerce/api-plugin-inventory/src/simpleSchemas.js";

import {
  SimpleInventoryCollectionSchema as SimpleInventory
} from "@reactioncommerce/api-plugin-inventory-simple/src/simpleSchemas.js";

import {
  NavigationItem,
  NavigationTree,
  NavigationTreeItem
} from "@reactioncommerce/api-plugin-navigation/src/simpleSchemas.js";

import {
  SelectedFulfillmentOption,
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
} from "@reactioncommerce/api-plugin-orders/src/simpleSchemas.js";

import {
  extendSimplePricingSchemas
} from "@reactioncommerce/api-plugin-pricing-simple/src/simpleSchemas.js";

import {
  Product,
  ProductVariant
} from "@reactioncommerce/api-plugin-products/src/simpleSchemas.js";

import {
  Shop
} from "@reactioncommerce/api-plugin-shops/src/simpleSchemas.js";

import {
  methodSchema as FulfillmentMethod,
  restrictionSchema as Restriction
} from "@reactioncommerce/api-plugin-fulfillment-method-shipping-flat-rate/src/simpleSchemas.js";

import {
  Sitemap
} from "@reactioncommerce/api-plugin-sitemap-generator/src/simpleSchemas.js";

import {
  Surcharge
} from "@reactioncommerce/api-plugin-surcharges/src/simpleSchemas.js";

import {
  Tag
} from "@reactioncommerce/api-plugin-tags/src/simpleSchemas.js";

import {
  extendTaxesSchemas
} from "@reactioncommerce/api-plugin-taxes/src/simpleSchemas.js";

import {
  TaxRates
} from "@reactioncommerce/api-plugin-taxes-flat-rate/src/simpleSchemas.js";

import {
  MethodEmptyData,
  FulfillmentMethodSchema,
  fulfillmentTypeSchema,
  extendFulfillmentSchemas
} from "@reactioncommerce/api-plugin-fulfillment/src/simpleSchemas.js";

import {
  Promotion
} from "@reactioncommerce/api-plugin-promotions/src/simpleSchemas.js";


const schemasToAddToFactory = {
  MethodEmptyData,
  FulfillmentMethodSchema,
  fulfillmentTypeSchema,
  Shipment,
  ShippingMethod,
  SelectedFulfillmentOption,
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
  Email,
  EmailTemplates,
  FulfillmentMethod,
  Group,
  NavigationItem,
  NavigationTree,
  NavigationTreeItem,
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
  Restriction,
  ShipmentQuote,
  Shop,
  SimpleInventory,
  Sitemap,
  Surcharge,
  Tag,
  TaxRates,
  Promotion
};

// Extend before creating factories in case some of the added fields
// are required.
extendInventorySchemas(schemasToAddToFactory);
extendSimplePricingSchemas(schemasToAddToFactory);
extendTaxesSchemas(schemasToAddToFactory);
extendOrdersSchemas(schemasToAddToFactory);
extendFulfillmentSchemas(schemasToAddToFactory, ["shipping", "mockType", "undecided"]);

// Adds each to `Factory` object. For example, `Factory.Cart`
// will be the factory that builds an object that matches the
// `Cart` schema.
Object.keys(schemasToAddToFactory).forEach((key) => {
  createFactoryForSchema(key, schemasToAddToFactory[key]);
});

export default Factory;
