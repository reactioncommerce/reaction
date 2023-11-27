import Random from "@reactioncommerce/random";

/**
 * @summary create the cart message
 * @param {String} params.title - The message title
 * @param {String} params.message - The message body
 * @param {String} params.severity - The message severity
 * @returns {Object} - The cart message
 */
export default function createCartMessage({ title, message, severity = "info", ...params }) {
  return {
    _id: Random.id(),
    title,
    message,
    severity,
    acknowledged: false,
    requiresReadAcknowledgement: true,
    ...params
  };
}
