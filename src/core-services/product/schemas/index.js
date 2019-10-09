import { createRequire } from "module";

const require = createRequire(import.meta.url);

const product = require("./product.graphql");
const schema = require("./schema.graphql");

export default [product, schema];
