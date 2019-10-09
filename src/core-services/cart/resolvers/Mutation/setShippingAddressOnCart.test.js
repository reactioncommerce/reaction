import setShippingAddressOnCart from "./setShippingAddressOnCart.js";

const internalAddressId = "999";
const opaqueAddressId = "cmVhY3Rpb24vYWRkcmVzczo5OTk=";
const internalCartId = "555";
const opaqueCartId = "cmVhY3Rpb24vY2FydDo1NTU=";
const cartToken = "TOKEN";

test("correctly passes through to mutations.setShippingAddressOnCart", async () => {
  const fakeResult = {
    cart: { _id: "123" }
  };

  const mockMutation = jest.fn().mockName("mutations.setShippingAddressOnCart");
  mockMutation.mockReturnValueOnce(Promise.resolve(fakeResult));
  const context = {
    mutations: {
      setShippingAddressOnCart: mockMutation
    }
  };

  const result = await setShippingAddressOnCart(null, {
    input: {
      address: { foo: "bar" },
      addressId: opaqueAddressId,
      cartId: opaqueCartId,
      cartToken,
      clientMutationId: "clientMutationId"
    }
  }, context);

  expect(result).toEqual({
    ...fakeResult,
    clientMutationId: "clientMutationId"
  });

  expect(mockMutation).toHaveBeenCalledWith(context, {
    address: { foo: "bar" },
    addressId: internalAddressId,
    cartId: internalCartId,
    cartToken
  });
});
