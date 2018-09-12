import catalogItemsResolver from "./catalogItems";
import getFakeMongoCursor from "/imports/test-utils/helpers/getFakeMongoCursor";

const opaqueShopId = "cmVhY3Rpb24vc2hvcDoxMjM="; // reaction/shop:123
const opaqueTagId = "cmVhY3Rpb24vdGFnOjQ1Ng=="; // reaction/tag:456
const shopIds = [opaqueShopId];
const tagIds = [opaqueTagId];

const mockItems = [
  { _id: "a1", title: "Item 1" },
  { _id: "b2", title: "Item 2" },
  { _id: "c3", title: "Item 3" }
];

const mockItemsQuery = getFakeMongoCursor("Catalog", mockItems);

test("calls queries.catalogItems and returns a partial connection", async () => {
  const catalogItems = jest.fn().mockName("queries.catalogItems").mockReturnValueOnce(Promise.resolve(mockItemsQuery));

  const result = await catalogItemsResolver({}, {
    shopIds,
    tagIds
  }, {
    queries: { catalogItems }
  });

  expect(result).toEqual({
    nodes: mockItems,
    pageInfo: {
      endCursor: "c3",
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor: "a1"
    },
    totalCount: 3
  });

  expect(catalogItems).toHaveBeenCalled();
  expect(catalogItems.mock.calls[0][1]).toEqual({
    shopIds: ["123"],
    tagIds: ["456"]
  });
});
