import mockContext from "/imports/test-utils/helpers/mockContext";
import addTag from "./addTag";

beforeEach(() => {
  jest.resetAllMocks();
});

test("calls mutations.addTag and returns the AddTagPayload on success", async () => {
  mockContext.userHasPermission.mockReturnValueOnce(true);
  mockContext.collections.Tags.insertOne.mockReturnValueOnce({ result: { ok: 1 } });

  const input = {
    input: {
      name: "shirt",
      displayTitle: "Shirt"
    }
  };
  const result = await addTag(null, input, mockContext);

  expect(result.tag).toBeDefined();
  expect(mockContext.collections.Tags.insertOne).toHaveBeenCalled();
});

test("calls mutations.addTag and throws for non admins", async () => {
  mockContext.userHasPermission.mockReturnValueOnce(false);
  mockContext.collections.Tags.insertOne.mockReturnValueOnce({ result: { ok: 1 } });

  const result = addTag(null, {}, mockContext);
  expect(result).rejects.toThrowErrorMatchingSnapshot();
  expect(mockContext.collections.Tags.insertOne).not.toHaveBeenCalled();
});
