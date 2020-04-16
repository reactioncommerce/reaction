import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import ReactionError from "@reactioncommerce/reaction-error";
import removeTag from "./removeTag.js";

const testShopId = "1234";
const testTagId = "5678";

beforeEach(() => {
  jest.resetAllMocks();
});

test("calls mutations.removeTag and returns the RemoveTagPayload on success", async () => {
  mockContext.validatePermissions.mockReturnValueOnce(Promise.resolve(null));
  mockContext.collections.Tags.deleteOne.mockReturnValueOnce({ result: { ok: 1 } });
  mockContext.collections.Tags.findOne.mockReturnValueOnce({
    shopId: testShopId,
    tagId: testTagId
  });

  const input = {
    input: {
      shopId: testShopId,
      tagId: testTagId
    }
  };
  const result = await removeTag(mockContext, input);

  expect(result).toEqual({
    shopId: testShopId,
    tagId: testTagId
  });
  expect(mockContext.collections.Tags.deleteOne).toHaveBeenCalled();
});

test("calls mutations.removeTag and throws for non admins", async () => {
  mockContext.validatePermissions.mockImplementation(() => {
    throw new ReactionError("access-denied", "Access Denied");
  });
  mockContext.collections.Tags.deleteOne.mockReturnValueOnce({ result: { ok: 1 } });

  const result = removeTag(mockContext, {});
  expect(result).rejects.toThrowErrorMatchingSnapshot();
  expect(mockContext.collections.Tags.deleteOne).not.toHaveBeenCalled();
});
