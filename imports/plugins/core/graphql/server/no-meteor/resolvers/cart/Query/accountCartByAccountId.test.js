import accountCartByAccountId from "./accountCartByAccountId";

test("calls queries.cart.accountCartByAccountId and returns the result", async () => {
  const mockResponse = "MOCK_RESPONSE";
  const mockQuery = jest.fn().mockName("queries.cart.accountCartByAccountId").mockReturnValueOnce(Promise.resolve(mockResponse));

  const result = await accountCartByAccountId(null, { /* TODO */ }, {
    queries: { cart: { accountCartByAccountId: mockQuery } },
    userId: "123"
  });

  expect(result).toEqual(mockResponse);
  expect(mockQuery).toHaveBeenCalled();
});
