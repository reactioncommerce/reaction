import { createRequire } from "module";

const require = createRequire(import.meta.url);

const schema = require("./schema.graphql");

export default [schema];
