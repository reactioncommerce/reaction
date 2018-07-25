import reconcileCarts from "./reconcileCarts";

const shopId = "123";
const opaqueShopId = "cmVhY3Rpb24vc2hvcDoxMjM=";
const internalAnonymousCartId = "555";
const opaqueAnonymousCartId = "cmVhY3Rpb24vY2FydDo1NTU=";
const anonymousCartToken = "TOKEN";

test("correctly passes through to mutations.cart.reconcileCarts", async () => {
  const fakeResult = {
    cart: { _id: "123" }
  };

  const mockMutation = jest.fn().mockName("mutations.cart.reconcileCarts");
  mockMutation.mockReturnValueOnce(Promise.resolve(fakeResult));
  const context = {
    mutations: {
      cart: {
        reconcileCarts: mockMutation
      }
    }
  };

  const result = await reconcileCarts(null, {
    input: {
      anonymousCartId: opaqueAnonymousCartId,
      anonymousCartToken,
      clientMutationId: "clientMutationId",
      mode: "merge",
      shopId: opaqueShopId
    }
  }, context);

  expect(result).toEqual({
    cart: { _id: "123" },
    clientMutationId: "clientMutationId"
  });

  expect(mockMutation).toHaveBeenCalledWith(context, {
    anonymousCartId: internalAnonymousCartId,
    anonymousCartToken,
    mode: "merge",
    shopId
  });
});
