import primaryShop from "./primaryShop.js";

const fakeShopId = "W64ZQe9RUMuAoKrli";

const fakeShop = {
  _id: fakeShopId,
  name: "Reaction"
};

test("calls queries.primaryShop and returns the correct shop", async () => {
  const primaryShopMock = jest.fn().mockName("queries.primaryShop").mockReturnValueOnce(Promise.resolve(fakeShop));

  const shopObject = await primaryShop(null, null, {
    queries: {
      primaryShop: primaryShopMock
    }
  });

  expect(shopObject).toEqual(fakeShop);

  expect(primaryShopMock).toHaveBeenCalled();
});
