import { createFactoryForSchema, Factory } from "@reactioncommerce/data-factory";

import {
  Cart,
  ShipmentQuote
} from "@reactioncommerce/api-plugin-carts/src/simpleSchemas.js";

const schemasToAddToFactory = {
  Cart,
  ShipmentQuote
};

// Adds each to `Factory` object. For example, `Factory.Cart`
// will be the factory that builds an object that matches the
// `Cart` schema.
Object.keys(schemasToAddToFactory).forEach((key) => {
  createFactoryForSchema(key, schemasToAddToFactory[key]);
});

export default Factory;
