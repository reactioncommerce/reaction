import { createFactoryForSchema, Factory } from "@reactioncommerce/data-factory";
import * as coreSchemas from "/imports/collections/schemas";
import * as ordersSchemas from "/imports/plugins/core/orders/server/no-meteor/simpleSchemas";
import * as taxSchemas from "/imports/plugins/core/taxes/lib/simpleSchemas";

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
