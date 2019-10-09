import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import addTag from "./addTag.js";

beforeEach(() => {
  jest.resetAllMocks();
});

test("calls mutations.addTag and returns the AddTagPayload on success", async () => {
  mockContext.userHasPermission.mockReturnValueOnce(true);
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
  mockContext.userHasPermission.mockReturnValueOnce(false);
  mockContext.collections.Tags.insertOne.mockReturnValueOnce({ result: { ok: 1 } });

  const result = addTag(mockContext, {});
  expect(result).rejects.toThrowErrorMatchingSnapshot();
  expect(mockContext.collections.Tags.insertOne).not.toHaveBeenCalled();
});
