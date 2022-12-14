import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import hashToken from "@reactioncommerce/api-utils/hashToken.js";
import acknowledgeCartMessage from "./acknowledgeCartMessage.js";

beforeEach(() => {
  jest.resetAllMocks();
});

test("Should update cart message success when accountId is provided", async () => {
  const cartId = "cartId";
  const messageId = "messageId";
  const cartToken = null;
  const accountId = "accountId";

  const cart = {
    _id: "cartId",
    accountId: "accountId",
    messages: [{ _id: "messageId", requiresReadAcknowledgement: true, acknowledged: false }]
  };

  mockContext.accountId = accountId;
  mockContext.collections = {
    accountId,
    Cart: {
      findOne: jest.fn().mockName("collections.Cart.findOne").mockResolvedValue(cart),
      findOneAndUpdate: jest
        .fn()
        .mockName("collections.Cart.findOneAndUpdate")
        // eslint-disable-next-line id-length
        .mockResolvedValue({ value: cart })
    }
  };

  const updatedCart = { ...cart };
  updatedCart.messages[0].acknowledged = true;

  const result = await acknowledgeCartMessage(mockContext, { cartId, messageId, cartToken });
  expect(mockContext.collections.Cart.findOne).toHaveBeenCalledWith({ _id: cartId, accountId });
  expect(result).toEqual({ cart: updatedCart });
});

test("should update cart message success when anonymousAccessToken is provided", async () => {
  const cartId = "cartId";
  const messageId = "messageId";
  const cartToken = "anonymousAccessToken";

  const cart = {
    _id: "cartId",
    anonymousAccessToken: "anonymousAccessToken",
    messages: [{ _id: "messageId", requiresReadAcknowledgement: true, acknowledged: false }]
  };

  mockContext.accountId = undefined;
  mockContext.collections = {
    Cart: {
      findOne: jest.fn().mockName("collections.Cart.findOne").mockResolvedValue(cart),
      findOneAndUpdate: jest
        .fn()
        .mockName("collections.Cart.findOneAndUpdate")
        // eslint-disable-next-line id-length
        .mockResolvedValue({ value: cart })
    }
  };

  const updatedCart = { ...cart };
  updatedCart.messages[0].acknowledged = true;

  const result = await acknowledgeCartMessage(mockContext, { cartId, messageId, cartToken });
  expect(mockContext.collections.Cart.findOne).toHaveBeenCalledWith({ _id: cartId, anonymousAccessToken: hashToken(cartToken) });
  expect(result).toEqual({ cart: updatedCart });
});

test("should throw error when accountId and cartToken are not provided", async () => {
  const cartId = "cartId";
  const messageId = "messageId";
  const cartToken = null;

  mockContext.accountId = undefined;

  try {
    await acknowledgeCartMessage(mockContext, { cartId, messageId, cartToken });
  } catch (error) {
    expect(error.error).toEqual("invalid-params");
    expect(error.message).toEqual("Cart token not provided");
  }
});

test("should throw error when cart is not found", async () => {
  const cartId = "cartId";
  const messageId = "messageId";
  const cartToken = null;

  mockContext.accountId = undefined;
  mockContext.collections = {
    Cart: {
      findOne: jest.fn().mockName("collections.Cart.findOne").mockResolvedValue(null)
    }
  };
  try {
    await acknowledgeCartMessage(mockContext, { cartId, messageId, cartToken });
  } catch (error) {
    expect(error.error).toEqual("invalid-params");
    expect(error.message).toEqual("Cart token not provided");
  }
});

test("should throw error when cart message is not found", async () => {
  const cartId = "cartId";
  const messageId = "not-found-messageId";
  const accountId = "accountId";
  const cartToken = null;

  const cart = {
    _id: "cartId",
    accountId: "accountId",
    messages: [{ _id: "messageId", requiresReadAcknowledgement: true, acknowledged: false }]
  };

  mockContext.accountId = accountId;
  mockContext.collections = {
    Cart: {
      findOne: jest.fn().mockName("collections.Cart.findOne").mockResolvedValue(cart),
      findOneAndUpdate: jest
        .fn()
        .mockName("collections.Cart.findOneAndUpdate")
        // eslint-disable-next-line id-length
        .mockResolvedValue({ result: { n: 0 } })
    }
  };
  try {
    await acknowledgeCartMessage(mockContext, { cartId, messageId, cartToken, accountId });
  } catch (error) {
    expect(error.message).toEqual("Message not found");
    expect(error.error).toEqual("not-found");
  }
});

test("should throw error when cart message does not require acknowledgement", async () => {
  const cartId = "cartId";
  const messageId = "messageId";
  const accountId = "accountId";
  const cartToken = null;

  const cart = {
    _id: "cartId",
    accountId: "accountId",
    messages: [{ _id: "messageId", requiresReadAcknowledgement: false }]
  };

  mockContext.accountId = accountId;
  mockContext.collections = {
    Cart: {
      findOne: jest.fn().mockName("collections.Cart.findOne").mockResolvedValue(cart),
      findOneAndUpdate: jest
        .fn()
        .mockName("collections.Cart.findOneAndUpdate")
        // eslint-disable-next-line id-length
        .mockResolvedValue({ result: { n: 0 } })
    }
  };
  try {
    await acknowledgeCartMessage(mockContext, { cartId, messageId, cartToken, accountId });
  } catch (error) {
    expect(error.message).toEqual("Message does not require acknowledgement");
    expect(error.error).toEqual("invalid-param");
  }
});

test("should throw error when can't update cart message", async () => {
  const cartId = "cartId";
  const messageId = "messageId";
  const accountId = "accountId";
  const cartToken = null;

  const cart = {
    _id: "cartId",
    accountId: "accountId",
    messages: [{ _id: "messageId", requiresReadAcknowledgement: true, acknowledged: false }]
  };

  mockContext.accountId = accountId;
  mockContext.collections = {
    Cart: {
      findOne: jest.fn().mockName("collections.Cart.findOne").mockResolvedValue(cart),
      findOneAndUpdate: jest
        .fn()
        .mockName("collections.Cart.findOneAndUpdate")
        // eslint-disable-next-line id-length
        .mockResolvedValue({ result: { n: 0 } })
    }
  };
  try {
    await acknowledgeCartMessage(mockContext, { cartId, messageId, cartToken, accountId });
  } catch (error) {
    expect(error.message).toEqual("Unable to update cart");
    expect(error.error).toEqual("server-error");
  }
});
