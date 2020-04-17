import { createFactoryForSchema, Factory } from "@reactioncommerce/data-factory";

import {
  Shop
} from "@reactioncommerce/api-plugin-shops/src/simpleSchemas.js";

const schemasToAddToFactory = {
  Shop
};

// Adds each to `Factory` object. For example, `Factory.Cart`
// will be the factory that builds an object that matches the
// `Cart` schema.
Object.keys(schemasToAddToFactory).forEach((key) => {
  createFactoryForSchema(key, schemasToAddToFactory[key]);
});

export default Factory;
