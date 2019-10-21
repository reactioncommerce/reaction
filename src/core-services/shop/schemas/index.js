import importAsString from "@reactioncommerce/api-utils/importAsString.js";

const createShop = importAsString("./createShop.graphql");
const schema = importAsString("./schema.graphql");
const updateShop = importAsString("./updateShop.graphql");

export default [createShop, schema, updateShop];
