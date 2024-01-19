/**
 * @summary Publishes a cart updated event
 * @param {Object} context - The application context
 * @param {Object} cart - The cart that was updated
 * @param {Boolean} params.publishUpdatedEvent - Whether to prevent publishing the event
 * @returns {void} - undefined
 */
export default function publishCartUpdatedEvent(context, cart, { publishUpdatedEvent = undefined }) {
  if (!context.app.hasSubscriptionsEnabled || !publishUpdatedEvent) return;
  context.pubSub.publish("CART_UPDATED", { cartUpdated: cart });
}
