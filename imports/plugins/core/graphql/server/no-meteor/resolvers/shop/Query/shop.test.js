import shop from "./shop";

const fakeShopId = "W64ZQe9RUMuAoKrli";
const opaqueShopId = "cmVhY3Rpb24vc2hvcDpXNjRaUWU5UlVNdUFvS3JsaQ==";

const fakeShop = {
  _id: fakeShopId,
  name: "Reaction"
};

test("calls queries.shops.shopById and returns the requested shop", async () => {
  const shopById = jest.fn().mockName("queries.shops.shopById").mockReturnValueOnce(Promise.resolve(fakeShop));

  const shopObject = await shop(null, { id: opaqueShopId }, { queries: { shops: { shopById } } });

  expect(shopObject).toEqual(fakeShop);

  expect(shopById).toHaveBeenCalled();
  expect(shopById.mock.calls[0][1]).toBe(fakeShopId);
});
