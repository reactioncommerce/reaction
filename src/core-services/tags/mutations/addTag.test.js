import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import ReactionError from "@reactioncommerce/reaction-error";
import addTag from "./addTag.js";

beforeEach(() => {
  jest.resetAllMocks();
});

test("calls mutations.addTag and returns the AddTagPayload on success", async () => {
  mockContext.validatePermissions.mockReturnValueOnce(Promise.resolve(null));
  mockContext.collections.Tags.insertOne.mockReturnValueOnce({ result: { ok: 1 } });

  const input = {
    shopId: "1234",
    name: "shirt",
    displayTitle: "Shirt",
    isVisible: true
  };
  const result = await addTag(mockContext, input);

  expect(result).toBeDefined();
  expect(mockContext.collections.Tags.insertOne).toHaveBeenCalled();
});

test("calls mutations.addTag and throws for non admins", async () => {
  mockContext.validatePermissions.mockImplementation(() => {
    throw new ReactionError("access-denied", "Access Denied");
  });
  mockContext.collections.Tags.insertOne.mockReturnValueOnce({ result: { ok: 1 } });

  const result = addTag(mockContext, {});
  expect(result).rejects.toThrowErrorMatchingSnapshot();
  expect(mockContext.collections.Tags.insertOne).not.toHaveBeenCalled();
});
