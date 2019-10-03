import { encodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";
import { encodeTagOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/tag";
import updateTag from "./updateTag.js";

beforeEach(() => {
  jest.resetAllMocks();
});

test("calls Mutation.updateTag and returns the UpdateTagPayload on success", async () => {
  const shopId = encodeShopOpaqueId("s1");
  const tagId = encodeTagOpaqueId("t1");
  const tag = {
    isVisible: true,
    name: "shirts",
    displayTitle: "Shirts"
  };

  const fakeResult = { _id: tagId, shopId, ...tag };
  const mockMutation = jest.fn().mockName("mutations.updateTag");
  mockMutation.mockReturnValueOnce(Promise.resolve(fakeResult));

  const context = {
    mutations: {
      updateTag: mockMutation
    }
  };

  const result = await updateTag(null, {
    input: {
      shopId,
      tagId,
      clientMutationId: "clientMutationId"
    }
  }, context);

  expect(result).toEqual({
    tag: fakeResult,
    clientMutationId: "clientMutationId"
  });
});
