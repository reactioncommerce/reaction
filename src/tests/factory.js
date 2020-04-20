import { createFactoryForSchema, Factory } from "@reactioncommerce/data-factory";

import {
  CartAddress
} from "@reactioncommerce/api-plugin-carts/src/simpleSchemas.js";

import {
  CommonOrder,
  CommonOrderItem,
  OrderAddress
} from "@reactioncommerce/api-plugin-orders/src/simpleSchemas.js";

import {
  Taxes,
  TaxServiceItemTax,
  TaxServiceResult,
  TaxSummary
} from "../simpleSchemas.js";

const schemasToAddToFactory = {
  CartAddress,
  CommonOrder,
  CommonOrderItem,
  OrderAddress,
  Taxes,
  TaxServiceItemTax,
  TaxServiceResult,
  TaxSummary
};

// Adds each to `Factory` object. For example, `Factory.Cart`
// will be the factory that builds an object that matches the
// `Cart` schema.
Object.keys(schemasToAddToFactory).forEach((key) => {
  createFactoryForSchema(key, schemasToAddToFactory[key]);
});

export default Factory;
