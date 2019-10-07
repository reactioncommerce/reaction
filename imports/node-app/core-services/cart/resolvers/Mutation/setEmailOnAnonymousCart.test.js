import setEmailOnAnonymousCart from "./setEmailOnAnonymousCart.js";

const internalCartId = "555";
const opaqueCartId = "cmVhY3Rpb24vY2FydDo1NTU=";
const email = "email@address.com";
const token = "TOKEN";

test("correctly passes through to mutations.setEmailOnAnonymousCart", async () => {
  const fakeResult = {
    cart: { _id: "123" }
  };

  const mockMutation = jest.fn().mockName("mutations.setEmailOnAnonymousCart");
  mockMutation.mockReturnValueOnce(Promise.resolve(fakeResult));
  const context = {
    mutations: {
      setEmailOnAnonymousCart: mockMutation
    }
  };

  const result = await setEmailOnAnonymousCart(null, {
    input: {
      cartId: opaqueCartId,
      clientMutationId: "clientMutationId",
      email,
      token
    }
  }, context);

  expect(result).toEqual({
    ...fakeResult,
    clientMutationId: "clientMutationId"
  });

  expect(mockMutation).toHaveBeenCalledWith(context, {
    cartId: internalCartId,
    email,
    token
  });
});
