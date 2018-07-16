import reconcileCarts from "./reconcileCarts";

test("correctly passes through to mutations.cart.reconcileCarts", async () => {
  const fakeResult = { /* TODO */ };

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
      /* TODO */
      clientMutationId: "clientMutationId"
    }
  }, context);

  expect(result).toEqual({
    renameMe: fakeResult,
    clientMutationId: "clientMutationId"
  });
});
