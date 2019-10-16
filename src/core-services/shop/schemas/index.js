import { createRequire } from "module";

const require = createRequire(import.meta.url);

const createShop = require("./createShop.graphql");
const schema = require("./schema.graphql");
const updateShop = require("./updateShop.graphql");

export default [createShop, schema, updateShop];
