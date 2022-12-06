import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import acknowledgeCartMessage from "./acknowledgeCartMessage.js";

test("correctly passes through to internal mutation function", async () => {
  const cartId = "cartId";
  const messageId = "messageId";
  const cartToken = "cartToken";
  const clientMutationId = "clientMutationId";
  const cart = { _id: "cartId" };

  mockContext.mutations = {
    acknowledgeCartMessage: jest.fn().mockName("mutations.acknowledgeCartMessage").mockResolvedValue({ cart })
  };

  const result = await acknowledgeCartMessage(null, { input: { cartId, messageId, cartToken, clientMutationId } }, mockContext);

  expect(result).toEqual({ cart, clientMutationId });
  expect(mockContext.mutations.acknowledgeCartMessage).toHaveBeenCalledWith(mockContext, { cartId, messageId, cartToken });
});
