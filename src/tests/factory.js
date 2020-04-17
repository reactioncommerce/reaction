import { createFactoryForSchema, Factory } from "@reactioncommerce/data-factory";

import {
  Taxes,
  TaxServiceItemTax,
  TaxServiceResult,
  TaxSummary
} from "../simpleSchemas.js";

const schemasToAddToFactory = {
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
