import importAsString from "@reactioncommerce/api-utils/importAsString.js";

const retryFailedEmail = importAsString("./retryFailedEmail.graphql");

export default [retryFailedEmail];
