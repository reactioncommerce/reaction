import { createRequire } from "module";

const require = createRequire(import.meta.url);

const settings = require("./settings.graphql");

export default [settings];
