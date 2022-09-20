import { encodeShopOpaqueId, encodeTagOpaqueId } from "../../xforms/id.js";
import tagQuery from "./tag.js";

beforeEach(() => {
  jest.resetAllMocks();
});

test("calls Query.tag and returns the tag on success", async () => {
  const shopId = encodeShopOpaqueId("s1");
  const tagId = encodeTagOpaqueId("t1");
  const tag = {
    _id: "t1",
    shopId: "s1",
    isVisible: true,
    name: "shirts",
    displayTitle: "Shirts"
  };

  const fakeResult = { _id: tagId, shopId, ...tag };
  const mockMutation = jest.fn().mockName("queries.tag");
  mockMutation.mockReturnValueOnce(Promise.resolve(fakeResult));

  const context = {
    queries: {
      tag: mockMutation
    }
  };

  const result = await tagQuery(null, {
    input: {
      shopId,
      tagId,
      clientMutationId: "clientMutationId"
    }
  }, context);

  expect(result).toEqual(tag);
});
