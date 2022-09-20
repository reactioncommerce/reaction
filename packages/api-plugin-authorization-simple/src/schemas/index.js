import importAsString from "@reactioncommerce/api-utils/importAsString.js";

const group = importAsString("./group.graphql");
const role = importAsString("./role.graphql");

export default [group, role];
