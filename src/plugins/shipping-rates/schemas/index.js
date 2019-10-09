import { createRequire } from "module";

const require = createRequire(import.meta.url);

const schema = require("./schema.graphql");
const restrictions = require("./restrictions.graphql");

export default [schema, restrictions];
