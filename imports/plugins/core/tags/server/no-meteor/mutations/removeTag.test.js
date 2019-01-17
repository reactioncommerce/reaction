import mockContext from "/imports/test-utils/helpers/mockContext";
import removeTag from "./removeTag";

const testShopId = "1234";
const testTagId = "5678";

beforeEach(() => {
  jest.resetAllMocks();
});

test("calls mutations.removeTag and returns the RemoveRedirectRulePayload on success", async () => {
  mockContext.userHasPermission.mockReturnValueOnce(true);
  mockContext.collections.Tags.deleteOne.mockReturnValueOnce({ result: { ok: 1 } });

  const input = {
    input: {
      shopId: testShopId,
      tagId: testTagId
    }
  };
  const result = await removeTag(null, input, mockContext);

  expect(result.wasRemoved).toBe(true);
  expect(mockContext.collections.Tags.deleteOne).toHaveBeenCalled();
});

test("calls mutations.removeTag and throws for non admins", async () => {
  mockContext.userHasPermission.mockReturnValueOnce(false);
  mockContext.collections.Tags.deleteOne.mockReturnValueOnce({ result: { ok: 1 } });

  const result = removeTag(null, {}, mockContext);
  expect(result).rejects.toThrowErrorMatchingSnapshot();
  expect(mockContext.collections.Tags.deleteOne).not.toHaveBeenCalled();
});
