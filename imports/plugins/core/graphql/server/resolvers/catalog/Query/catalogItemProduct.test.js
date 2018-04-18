import catalogItemProductResolver from "./catalogItemProduct";
import getFakeMongoCursor from "/imports/test-utils/helpers/getFakeMongoCursor";

const mockItem = {
  _id: "a1",
  title: "Item Product"
};

const mockItemQuery = getFakeMongoCursor("CatalogItem", mockItem);

test("calls queries.catalogItemProduct and returns a partial connection", async () => {
  const catalogItemProduct = jest
    .fn()
    .mockName("queries.catalogItemProduct")
    .mockReturnValueOnce(Promise.resolve(mockItemQuery));
  const result = await catalogItemProductResolver(
    {},
    {},
    {
      queries: { catalogItemProduct }
    }
  );

  expect(result).toEqual({
    nodes: mockItem
  });
});
