import updateCartItemsQuantity from "./updateCartItemsQuantity";

test("correctly passes through to mutations.cart.updateCartItemsQuantity", async () => {
  const fakeResult = { /* TODO */ };

  const mockMutation = jest.fn().mockName("mutations.cart.updateCartItemsQuantity");
  mockMutation.mockReturnValueOnce(Promise.resolve(fakeResult));
  const context = {
    mutations: {
      cart: {
        updateCartItemsQuantity: mockMutation
      }
    }
  };

  const result = await updateCartItemsQuantity(null, {
    input: {
      /* TODO */
      clientMutationId: "clientMutationId"
    }
  }, context);

  expect(result).toEqual({
    renameMe: fakeResult,
    clientMutationId: "clientMutationId"
  });
});
