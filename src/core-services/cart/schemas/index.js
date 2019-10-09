import { createRequire } from "module";

const require = createRequire(import.meta.url);

const cart = require("./cart.graphql");
const checkout = require("./checkout.graphql");

export default [cart, checkout];
