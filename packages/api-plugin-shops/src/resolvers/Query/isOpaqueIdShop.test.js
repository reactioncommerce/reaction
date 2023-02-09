import shop from "./shop.js";

const fakeShopId = "W64ZQe9RUMuAoKrli";
const opaqueShopId = "cmVhY3Rpb24vc2hvcDpXNjRaUWU5UlVNdUFvS3JsaQ==";

const fakeShop = {
  _id: fakeShopId,
  name: "Reaction"
};

test("calls queries.shopById using OpaqueID and returns the requested shop", async () => {
  const shopById = jest.fn().mockName("queries.shopById").mockReturnValueOnce(Promise.resolve(fakeShop));
  const shopObject = await shop(null, { id: opaqueShopId }, { queries: { shopById } });

  expect(shopById).toHaveBeenCalledWith({ queries: { shopById } }, fakeShopId);
  expect(shopObject).toEqual(fakeShop);
});

test("calls queries.shopById using Non-OpaqueID and returns the requested shop", async () => {
  const shopById = jest.fn().mockName("queries.shopById").mockReturnValueOnce(Promise.resolve(fakeShop));
  const shopObject = await shop(null, { id: fakeShopId }, { queries: { shopById } });

  expect(shopById).toHaveBeenCalledWith({ queries: { shopById } }, fakeShopId);
  expect(shopObject).toEqual(fakeShop);
});
