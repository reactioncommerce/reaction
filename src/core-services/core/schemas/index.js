import { createRequire } from "module";

const require = createRequire(import.meta.url);

const address = require("./address.graphql");
const email = require("./email.graphql");
const metafield = require("./metafield.graphql");
const shop = require("./shop.graphql");
const tag = require("./tag.graphql");

export default [
  address,
  email,
  metafield,
  shop,
  tag
];
