import importAsString from "@reactioncommerce/api-utils/importAsString.js";

const schema = importAsString("./schema.graphql");
const updateTemplate = importAsString("./updateTemplate.graphql");

export default [
  schema,
  updateTemplate
];
