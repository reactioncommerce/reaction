import * as schemas from "imports/collections/schemas";
import { createFactoryForSchema, Factory } from "./dataFactory";

Object.keys(schemas).forEach((key) => {
  createFactoryForSchema(key, schemas[key]);
});

export default Factory;
