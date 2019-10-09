import { createFactoryForSchema, Factory } from "@reactioncommerce/data-factory";
import * as Schemas from "../simpleSchemas.js";

Object.keys(Schemas).forEach((key) => {
  createFactoryForSchema(key, Schemas[key]);
});

export default Factory;
