import reconcileCarts from "./reconcileCarts.js";

const internalAnonymousCartId = "555";
const opaqueAnonymousCartId = "cmVhY3Rpb24vY2FydDo1NTU=";
const anonymousCartToken = "TOKEN";

test("correctly passes through to mutations.reconcileCarts", async () => {
  const fakeResult = {
    cart: { _id: "123" }
  };

  const mockMutation = jest.fn().mockName("mutations.reconcileCarts");
  mockMutation.mockReturnValueOnce(Promise.resolve(fakeResult));
  const context = {
    mutations: {
      reconcileCarts: mockMutation
    }
  };

  const result = await reconcileCarts(null, {
    input: {
      anonymousCartId: opaqueAnonymousCartId,
      anonymousCartToken,
      clientMutationId: "clientMutationId",
      mode: "merge"
    }
  }, context);

  expect(result).toEqual({
    cart: { _id: "123" },
    clientMutationId: "clientMutationId"
  });

  expect(mockMutation).toHaveBeenCalledWith(context, {
    anonymousCartId: internalAnonymousCartId,
    anonymousCartToken,
    mode: "merge"
  });
});
