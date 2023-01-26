import importAsString from "@reactioncommerce/api-utils/importAsString.js";

const cart = importAsString("./cart.graphql");
const checkout = importAsString("./checkout.graphql");
const subscription = importAsString("./subscription.graphql");

export default [cart, checkout, subscription];
