import primaryShopId from "./primaryShopId";

const fakeShopId = "W64ZQe9RUMuAoKrli";

test("calls queries.primaryShopId and returns the requested ID", async () => {
  const primaryShopIdQuery = jest.fn().mockName("primaryShopId").mockReturnValueOnce(Promise.resolve(fakeShopId));

  const result = await primaryShopId(null, null, { queries: { primaryShopId: primaryShopIdQuery } });

  expect(result).toBe(fakeShopId);
  expect(primaryShopIdQuery).toHaveBeenCalled();
});
