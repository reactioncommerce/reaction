import accountCartByAccountId from "./accountCartByAccountId.js";

const shopId = "123";
const opaqueShopId = "cmVhY3Rpb24vc2hvcDoxMjM=";
const accountId = "444";
const opaqueAccountId = "cmVhY3Rpb24vYWNjb3VudDo0NDQ=";

test("calls queries.accountCartByAccountId and returns the result", async () => {
  const mockResponse = "MOCK_RESPONSE";
  const mockQuery = jest.fn().mockName("queries.accountCartByAccountId").mockReturnValueOnce(Promise.resolve(mockResponse));

  const context = {
    queries: { accountCartByAccountId: mockQuery },
    userId: "123"
  };

  const result = await accountCartByAccountId(null, {
    accountId: opaqueAccountId,
    shopId: opaqueShopId
  }, context);

  expect(result).toEqual(mockResponse);
  expect(mockQuery).toHaveBeenCalledWith(context, {
    accountId,
    shopId
  });
});
