import importAsString from "@reactioncommerce/api-utils/importAsString.js";

const emailJobs = importAsString("./emailJobs.graphql");
const retryFailedEmail = importAsString("./retryFailedEmail.graphql");

export default [emailJobs, retryFailedEmail];
