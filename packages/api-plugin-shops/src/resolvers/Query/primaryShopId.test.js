import primaryShopId from "./primaryShopId.js";

const fakeShopId = "W64ZQe9RUMuAoKrli";
const opaqueShopId = "cmVhY3Rpb24vc2hvcDpXNjRaUWU5UlVNdUFvS3JsaQ==";

test("calls queries.primaryShopId and returns the requested ID", async () => {
  const primaryShopIdQuery = jest.fn().mockName("primaryShopId").mockReturnValueOnce(Promise.resolve(fakeShopId));

  const result = await primaryShopId(null, null, { queries: { primaryShopId: primaryShopIdQuery } });

  expect(result).toBe(opaqueShopId);
  expect(primaryShopIdQuery).toHaveBeenCalled();
});
