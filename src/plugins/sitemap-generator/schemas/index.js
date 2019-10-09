import { createRequire } from "module";

const require = createRequire(import.meta.url);

const schema = require("./schema.graphql");
const settings = require("./settings.graphql");

export default [schema, settings];
