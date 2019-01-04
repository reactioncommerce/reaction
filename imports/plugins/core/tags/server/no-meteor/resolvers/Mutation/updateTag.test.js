/* eslint-disable id-length */
import mockContext from "/imports/test-utils/helpers/mockContext";
import updateTag from "./updateTag";

const testB64Id = "cmVhY3Rpb24vcmVkaXJlY3RSdWxlOjEyMzQ=";

beforeEach(() => {
  jest.resetAllMocks();
});

test("calls Mutation.updateTag and returns the UpdateTagPayload on success", async () => {
  mockContext.userHasPermission.mockReturnValueOnce(true);
  mockContext.collections.Tags.updateOne.mockReturnValueOnce({ result: { n: 1 } });
  mockContext.collections.Tags.findOne.mockReturnValueOnce({
    _id: "1234",
    isVisible: true,
    name: "shirts",
    displayTitle: "Shirts"
  });

  const input = {
    input: {
      id: testB64Id,
      isVisible: true,
      name: "shirts",
      displayTitle: "Shirts"
    }
  };
  const result = await updateTag(null, input, mockContext);

  expect(result.redirectRule).toBeDefined();
  expect(mockContext.collections.Tags.updateOne).toHaveBeenCalled();
});

test("calls Mutation.updateTag, removes rule from skipper returns the UpdateTagPayload on success", async () => {
  mockContext.userHasPermission.mockReturnValueOnce(true);
  mockContext.collections.Tags.updateOne.mockReturnValueOnce({ result: { n: 1 } });
  mockContext.collections.Tags.findOne.mockReturnValueOnce({
    _id: "1234",
    isVisible: false,
    name: "shirts",
    displayTitle: "Shirts"
  });

  const input = {
    input: {
      id: testB64Id,
      isVisible: false,
      name: "shirts",
      displayTitle: "Shirts"
    }
  };
  const result = await updateTag(null, input, mockContext);

  expect(result.redirectRule).toBeDefined();
  expect(mockContext.collections.Tags.updateOne).toHaveBeenCalled();
});

test("calls Mutation.updateTag and throws for non admins", async () => {
  mockContext.userHasPermission.mockReturnValueOnce(false);
  mockContext.collections.Tags.updateOne.mockReturnValueOnce({ result: { n: 1 } });

  // await expect(redirectRules(null, {}, mockContext)).rejects.toThrowError(/User does not have permission/);
  const result = updateTag(null, {}, mockContext);
  expect(result).rejects.toThrowErrorMatchingSnapshot();
  expect(mockContext.collections.Tags.updateOne).not.toHaveBeenCalled();
});
