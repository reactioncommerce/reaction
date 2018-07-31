import shopBySlug from "./shopBySlug";

const fakeShopId = "W64ZQe9RUMuAoKrli";
const fakeShopSlug = "reaction";

const fakeShop = {
  _id: fakeShopId,
  name: "Reaction",
  slug: fakeShopSlug
};

test("calls queries.shops.shopBySlug and returns the requested shop", async () => {
  const shopBySlug = jest.fn().mockName("queries.shops.shopBySlug").mockReturnValueOnce(Promise.resolve(fakeShop));
  const shopObject = await shopBySlug(null, { slug: fakeShopSlug }, { queries: { shops: { shopBySlug } } });

  expect(shopObject).toEqual(fakeShop);

  expect(shopBySlug).toHaveBeenCalled();
  expect(shopBySlug.mock.calls[0][1]).toBe(fakeShopSlug);
});
