import getFakeMongoCursor from "@reactioncommerce/api-utils/tests/getFakeMongoCursor.js";
import tagsResolver from "./tags.js";

const base64ID = "cmVhY3Rpb24vc2hvcDoxMjM="; // reaction/shop:123

const mockTags = [
  { _id: "a1", name: "Men" },
  { _id: "b2", name: "Women" },
  { _id: "c3", name: "Children" }
];

const mockTagsQuery = getFakeMongoCursor("Tags", mockTags);

test("calls queries.tags and returns a partial connection", async () => {
  const tags = jest.fn().mockName("queries.tags").mockReturnValueOnce(Promise.resolve(mockTagsQuery));

  const result = await tagsResolver({ _id: base64ID }, {}, {
    queries: { tags }
  }, { fieldNodes: [] });

  expect(result).toEqual({
    nodes: mockTags,
    pageInfo: {
      endCursor: "c3",
      startCursor: "a1"
    },
    totalCount: null
  });

  expect(tags).toHaveBeenCalled();
  expect(tags.mock.calls[0][1]).toBe("123");
});
