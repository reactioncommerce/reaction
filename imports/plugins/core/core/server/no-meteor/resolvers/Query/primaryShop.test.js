import primaryShop from "./primaryShop";

const fakeShopId = "W64ZQe9RUMuAoKrli";
const opaqueShopId = "cmVhY3Rpb24vc2hvcDpXNjRaUWU5UlVNdUFvS3JsaQ==";

const fakeShop = {
  _id: fakeShopId,
  name: "Reaction"
};

test("calls queries.primaryShop and returns the correct shop", async () => {
  const primaryShopIdMock = jest.fn().mockName("queries.primaryShopId").mockReturnValueOnce(Promise.resolve(fakeShopId));
  const shopByIdMock = jest.fn().mockName("queries.shopById").mockReturnValueOnce(Promise.resolve(fakeShop));

  const shopObject = await primaryShop(null, null, {
    queries: {
      primaryShopId: primaryShopIdMock,
      shopById: shopByIdMock,
      primaryShop
    }
  });

  expect(shopObject).toEqual(fakeShop);

  expect(primaryShopIdMock).toHaveBeenCalled();
  expect(shopByIdMock).toHaveBeenCalled();
});
