import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import archiveLocation from "./archiveLocation.js";

test("throws if validation check fails", async () => {
  const input = { shopId: "abc" };

  try {
    await archiveLocation(mockContext, input);
  } catch (error) {
    expect(error.error).toEqual("validation-error");
  }
});

test("should call mutations.archiveLocation and return the result", async () => {
  const input = { shopId: "abc", locationId: "123" };
  mockContext.collections = {
    Locations: {
      findOneAndUpdate: jest.fn().mockReturnValueOnce(Promise.resolve({
        modifiedCount: 1,
        value: {
          _id: "123",
          shopId: "abc"
        }
      }))
    }
  };

  const result = await archiveLocation(mockContext, input);

  expect(result).toEqual({
    success: true,
    location: {
      _id: "123",
      shopId: "abc"
    }
  });
});
