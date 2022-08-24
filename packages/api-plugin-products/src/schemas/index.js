import importAsString from "@reactioncommerce/api-utils/importAsString.js";

const product = importAsString("./product.graphql");
const schema = importAsString("./schema.graphql");

export default [product, schema];
