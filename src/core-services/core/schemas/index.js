import { createRequire } from "module";

const require = createRequire(import.meta.url);

const email = require("./email.graphql");
const metafield = require("./metafield.graphql");
const shop = require("./shop.graphql");
const tag = require("./tag.graphql");

export default [
  email,
  metafield,
  shop,
  tag
];
