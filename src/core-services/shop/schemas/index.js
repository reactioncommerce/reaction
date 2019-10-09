import { createRequire } from "module";

const require = createRequire(import.meta.url);

const schema = require("./schema.graphql");
const updateShop = require("./updateShop.graphql");

export default [schema, updateShop];
