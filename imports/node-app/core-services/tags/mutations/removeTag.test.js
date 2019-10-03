import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import removeTag from "./removeTag.js";

const testShopId = "1234";
const testTagId = "5678";

beforeEach(() => {
  jest.resetAllMocks();
});

test("calls mutations.removeTag and returns the RemoveTagPayload on success", async () => {
  mockContext.userHasPermission.mockReturnValueOnce(true);
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
  mockContext.userHasPermission.mockReturnValueOnce(false);
  mockContext.collections.Tags.deleteOne.mockReturnValueOnce({ result: { ok: 1 } });

  const result = removeTag(mockContext, {});
  expect(result).rejects.toThrowErrorMatchingSnapshot();
  expect(mockContext.collections.Tags.deleteOne).not.toHaveBeenCalled();
});
