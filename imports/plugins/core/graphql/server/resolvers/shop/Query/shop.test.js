import shop from "./shop";

const fakeShopId = "W64ZQe9RUMuAoKrli";
const opaqueShopId = "cmVhY3Rpb24vc2hvcDpXNjRaUWU5UlVNdUFvS3JsaQ==";

test("calls queries.shopById and returns the requested shop", async () => {
  const shopById = jest.fn().mockName("shopById").mockReturnValueOnce(Promise.resolve({
    _id: fakeShopId,
    name: "Reaction"
  }));

  const shopObject = await shop(null, { id: opaqueShopId }, { queries: { shopById } });

  expect(shopObject).toEqual({
    _id: "cmVhY3Rpb24vc2hvcDpXNjRaUWU5UlVNdUFvS3JsaQ==",
    name: "Reaction"
  });

  expect(shopById).toHaveBeenCalled();
  expect(shopById.mock.calls[0][1]).toBe(fakeShopId);
});
