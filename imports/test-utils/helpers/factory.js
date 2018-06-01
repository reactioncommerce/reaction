import { createFactoryForSchema, Factory } from "@reactioncommerce/data-factory";
import * as schemas from "imports/collections/schemas";

Object.keys(schemas).forEach((key) => {
  createFactoryForSchema(key, schemas[key]);
});

export default Factory;
