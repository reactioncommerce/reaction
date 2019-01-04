import mockContext from "/imports/test-utils/helpers/mockContext";
import removeTag from "./removeTag";

const testB64Id = "cmVhY3Rpb24vcmVkaXJlY3RSdWxlOjEyMzQ=";

beforeEach(() => {
  jest.resetAllMocks();
});

test("calls Mutation.removeTag and returns the RemoveRedirectRulePayload on success", async () => {
  mockContext.userHasPermission.mockReturnValueOnce(true);
  mockContext.collections.RedirectRules.deleteOne.mockReturnValueOnce({ result: { ok: 1 } });

  const input = {
    input: {
      _id: testB64Id
    }
  };
  const result = await removeTag(null, input, mockContext);

  expect(result.wasRemoved).toBe(true);
  expect(mockContext.collections.RedirectRules.deleteOne).toHaveBeenCalled();
});

test("calls Mutation.removeTag and throws for non admins", async () => {
  mockContext.userHasPermission.mockReturnValueOnce(false);
  mockContext.collections.RedirectRules.deleteOne.mockReturnValueOnce({ result: { ok: 1 } });

  const result = removeTag(null, {}, mockContext);
  expect(result).rejects.toThrowErrorMatchingSnapshot();
  expect(mockContext.collections.RedirectRules.deleteOne).not.toHaveBeenCalled();
});
