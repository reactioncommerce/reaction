import importAsString from "@reactioncommerce/api-utils/importAsString.js";

const schema = importAsString("./schema.graphql");
const addressValidationRuleSchema = importAsString("./AddressValidationRule.graphql");

export default [schema, addressValidationRuleSchema];
