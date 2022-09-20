import shop from "./shop.js";

const fakeShopId = "W64ZQe9RUMuAoKrli";
const opaqueShopId = "cmVhY3Rpb24vc2hvcDpXNjRaUWU5UlVNdUFvS3JsaQ==";

const fakeShop = {
  _id: fakeShopId,
  name: "Reaction"
};

test("calls queries.shopById and returns the requested shop", async () => {
  const shopById = jest.fn().mockName("queries.shopById").mockReturnValueOnce(Promise.resolve(fakeShop));

  const shopObject = await shop(null, { id: opaqueShopId }, { queries: { shopById } });

  expect(shopObject).toEqual(fakeShop);

  expect(shopById).toHaveBeenCalled();
  expect(shopById.mock.calls[0][1]).toBe(fakeShopId);
});
