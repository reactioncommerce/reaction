import addCartItems from "./addCartItems.js";

const internalCartId = "555";
const opaqueCartId = "cmVhY3Rpb24vY2FydDo1NTU=";
const token = "TOKEN";
const productId = "444";
const opaqueProductId = "cmVhY3Rpb24vcHJvZHVjdDo0NDQ=";
const productVariantId = "555";
const opaqueProductVariantId = "cmVhY3Rpb24vcHJvZHVjdDo1NTU=";

const items = [{
  productConfiguration: {
    productId: opaqueProductId,
    productVariantId: opaqueProductVariantId
  },
  quantity: 1
}];

test("correctly passes through to mutations.addCartItems", async () => {
  const fakeResult = {
    cart: { _id: "123" },
    incorrectPriceFailures: [],
    minOrderQuantityFailures: []
  };

  const mockMutation = jest.fn().mockName("mutations.addCartItems");
  mockMutation.mockReturnValueOnce(Promise.resolve(fakeResult));
  const context = {
    mutations: {
      addCartItems: mockMutation
    }
  };

  const result = await addCartItems(null, {
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
      productConfiguration: {
        productId,
        productVariantId
      },
      quantity: 1
    }],
    token
  });
});
