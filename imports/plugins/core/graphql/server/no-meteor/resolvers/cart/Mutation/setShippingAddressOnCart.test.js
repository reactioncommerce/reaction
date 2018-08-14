import setShippingAddressOnCart from "./setShippingAddressOnCart";

test("correctly passes through to mutations.cart.setShippingAddressOnCart", async () => {
  const fakeResult = { /* TODO */ };

  const mockMutation = jest.fn().mockName("mutations.cart.setShippingAddressOnCart");
  mockMutation.mockReturnValueOnce(Promise.resolve(fakeResult));
  const context = {
    mutations: {
      cart: {
        setShippingAddressOnCart: mockMutation
      }
    }
  };

  const result = await setShippingAddressOnCart(null, {
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
