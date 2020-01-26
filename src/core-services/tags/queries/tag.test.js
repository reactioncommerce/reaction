import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import tagQuery from "./tag.js";

beforeEach(() => {
  jest.resetAllMocks();
});

test("default - includes shopId and tag._id", async () => {
  const shopId = "s1";
  const slugOrId = "t1";
  const tag = {
    _id: "t1",
    shopId,
    isVisible: true,
    name: "shirts",
    displayTitle: "Shirts"
  };
  const query = {
    $or: [{ _id: slugOrId }, { slug: slugOrId }],
    shopId
  };
  mockContext.collections.Tags.findOne.mockReturnValueOnce(tag);

  const result = await tagQuery(mockContext, { shopId, slugOrId });

  expect(mockContext.collections.Tags.findOne).toHaveBeenCalledWith(query);
  expect(result).toBe(tag);
});

test("default - includes shopId and tag.slug", async () => {
  const shopId = "s1";
  const slugOrId = "slug1";
  const tag = {
    shopId,
    slug: slugOrId,
    isVisible: true,
    name: "shirts",
    displayTitle: "Shirts"
  };
  const query = {
    $or: [{ _id: slugOrId }, { slug: slugOrId }],
    shopId
  };
  mockContext.collections.Tags.findOne.mockReturnValueOnce(tag);

  const result = await tagQuery(mockContext, { shopId, slugOrId });

  expect(mockContext.collections.Tags.findOne).toHaveBeenCalledWith(query);
  expect(result).toBe(tag);
});
