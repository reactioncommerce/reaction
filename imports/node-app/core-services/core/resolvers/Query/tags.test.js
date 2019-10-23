import tagsResolver from "./tags.js";
import getFakeMongoCursor from "@reactioncommerce/api-utils/tests/getFakeMongoCursor.js";
import Factory from "/imports/test-utils/helpers/factory";

const base64ID = "cmVhY3Rpb24vc2hvcDoxMjM="; // reaction/shop:123
const mockTags = Factory.Tag.makeMany(3, { _id: (newId) => (newId + 100).toString() });
const mockTagsQuery = getFakeMongoCursor("Tags", mockTags);

test("calls queries.tags and returns a partial connection", async () => {
  const tags = jest
    .fn()
    .mockName("queries.tags")
    .mockReturnValueOnce(Promise.resolve(mockTagsQuery));

  const result = await tagsResolver(
    {},
    { shopId: base64ID },
    {
      queries: { tags }
    },
    { fieldNodes: [] }
  );

  expect(result).toEqual({
    nodes: mockTags,
    pageInfo: {
      endCursor: "102",
      startCursor: "100"
    },
    totalCount: null
  });

  expect(tags).toHaveBeenCalled();
  expect(tags.mock.calls[0][1]).toBe("123");
});
