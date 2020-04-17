import importAsString from "@reactioncommerce/api-utils/importAsString.js";

const cart = importAsString("./cart.graphql");
const checkout = importAsString("./checkout.graphql");

export default [cart, checkout];
