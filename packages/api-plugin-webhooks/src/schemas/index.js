import importAsString from "@reactioncommerce/api-utils/importAsString.js";

const registerWebhook = importAsString("./registerWebhook.graphql");
const deregisterWebhook = importAsString("./deregisterWebhook.graphql");
const webhook = importAsString("./webhook.graphql");
const updateWebhook = importAsString("./updateWebhook.graphql");

export default [
  registerWebhook,
  deregisterWebhook,
  webhook,
  updateWebhook
];
