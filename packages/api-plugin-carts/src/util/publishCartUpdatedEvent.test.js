import publishCartUpdatedEvent from "./publishCartUpdatedEvent.js";

const context = {
  app: {
    hasSubscriptionsEnabled: true
  },
  pubSub: {
    publish: jest.fn()
  }
};

test("shouldn't publish event when subscription is disabled", async () => {
  context.app.hasSubscriptionsEnabled = false;
  publishCartUpdatedEvent(context, {}, { publishUpdatedEvent: true });
  expect(context.pubSub.publish).not.toHaveBeenCalled();
});

test("shouldn't publish event when publishUpdatedEvent arg is undefined", async () => {
  context.app.hasSubscriptionsEnabled = true;
  publishCartUpdatedEvent(context, {}, { publishUpdatedEvent: undefined });
  expect(context.pubSub.publish).not.toHaveBeenCalled();
});

test("should publish cart updated event", async () => {
  context.app.hasSubscriptionsEnabled = true;
  const cart = { _id: "cartId" };
  publishCartUpdatedEvent(context, cart, { publishUpdatedEvent: true });
  expect(context.pubSub.publish).toHaveBeenCalledWith("CART_UPDATED", { cartUpdated: cart });
});
