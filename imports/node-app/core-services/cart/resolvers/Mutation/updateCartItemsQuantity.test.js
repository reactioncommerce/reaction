import updateCartItemsQuantity from "./updateCartItemsQuantity.js";

const internalCartId = "555";
const opaqueCartId = "cmVhY3Rpb24vY2FydDo1NTU=";
const token = "TOKEN";
const cartItemId = "666";
const opaqueCartItemId = "cmVhY3Rpb24vY2FydEl0ZW06NjY2";

const items = [{
  cartItemId: opaqueCartItemId,
  quantity: 1
}];

test("correctly passes through to mutations.updateCartItemsQuantity", async () => {
  const fakeResult = {
    cart: { _id: "123" }
  };

  const mockMutation = jest.fn().mockName("mutations.updateCartItemsQuantity");
  mockMutation.mockReturnValueOnce(Promise.resolve(fakeResult));
  const context = {
    mutations: {
      updateCartItemsQuantity: mockMutation
    }
  };

  const result = await updateCartItemsQuantity(null, {
    input: {
      cartId: opaqueCartId,
      clientMutationId: "clientMutationId",
      items,
      token
    }
  }, context);

  expect(result).toEqual({
    ...fakeResult,
    clientMutationId: "clientMutationId"
  });

  expect(mockMutation).toHaveBeenCalledWith(context, {
    cartId: internalCartId,
    items: [{
      cartItemId,
      quantity: 1
    }],
    token
  });
});
