import getFakeMongoCursor from "@reactioncommerce/api-utils/tests/getFakeMongoCursor.js";
import tagsResolver from "./tags.js";

const shopId = "123";

const mockTags = [
  { _id: "a1", name: "Men" },
  { _id: "b2", name: "Women" },
  { _id: "c3", name: "Children" }
];

const mockTagsQuery = getFakeMongoCursor("Tags", mockTags);

test("calls queries.tags and returns a partial connection", async () => {
  const tags = jest.fn().mockName("queries.tags").mockReturnValueOnce(Promise.resolve(mockTagsQuery));

  const context = {
    queries: { tags }
  };

  const result = await tagsResolver({ _id: shopId }, {}, context, { fieldNodes: [] });

  expect(result).toEqual({
    nodes: mockTags,
    pageInfo: {
      endCursor: "c3",
      startCursor: "a1"
    },
    totalCount: null
  });

  expect(tags).toHaveBeenCalledWith(context, shopId, {});
});
