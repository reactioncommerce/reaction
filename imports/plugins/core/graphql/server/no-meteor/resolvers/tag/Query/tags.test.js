import tagsResolver from "./tags";
import getFakeMongoCursor from "/imports/test-utils/helpers/getFakeMongoCursor";
import Factory from "/imports/test-utils/helpers/factory";

const base64ID = "cmVhY3Rpb24vc2hvcDoxMjM="; // reaction/shop:123
const mockTags = Factory.Tag.makeMany(3, { _id: (i) => (i + 100).toString() });
const mockTagsQuery = getFakeMongoCursor("Tags", mockTags);

test("calls queries.catalog.tags and returns a partial connection", async () => {
  const tags = jest
    .fn()
    .mockName("queries.catalog.tags")
    .mockReturnValueOnce(Promise.resolve(mockTagsQuery));

  const result = await tagsResolver(
    {},
    { shopId: base64ID },
    {
      queries: { catalog: { tags } }
    }
  );

  expect(result).toEqual({
    nodes: mockTags,
    pageInfo: {
      endCursor: "102",
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor: "100"
    },
    totalCount: 3
  });

  expect(tags).toHaveBeenCalled();
  expect(tags.mock.calls[0][1]).toBe("123");
});
