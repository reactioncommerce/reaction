import removeCartItems from "./removeCartItems.js";

const internalCartId = "555";
const opaqueCartId = "cmVhY3Rpb24vY2FydDo1NTU=";
const token = "TOKEN";
const cartItemIds = ["666"];
const opaqueCartItemIds = ["cmVhY3Rpb24vY2FydEl0ZW06NjY2"];

test("correctly passes through to mutations.removeCartItems", async () => {
  const fakeResult = {
    cart: { _id: "123" }
  };

  const mockMutation = jest.fn().mockName("mutations.removeCartItems");
  mockMutation.mockReturnValueOnce(Promise.resolve(fakeResult));
  const context = {
    mutations: {
      removeCartItems: mockMutation
    }
  };

  const result = await removeCartItems(null, {
    input: {
      cartId: opaqueCartId,
      cartItemIds: opaqueCartItemIds,
      clientMutationId: "clientMutationId",
      token
    }
  }, context);

  expect(result).toEqual({
    ...fakeResult,
    clientMutationId: "clientMutationId"
  });

  expect(mockMutation).toHaveBeenCalledWith(context, {
    cartId: internalCartId,
    cartItemIds,
    token
  });
});
