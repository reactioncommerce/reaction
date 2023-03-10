import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import createLocation from "./createLocation.js";

test("throws if permission check fails", async () => {
  const input = { shopId: "123", name: "Test location" };
  mockContext.validatePermissions.mockResolvedValue(Promise.reject(new Error("Access Denied")));

  try {
    await createLocation(null, { input }, mockContext);
  } catch (error) {
    expect(error.message).toEqual("Access Denied");
  }
});

test("calls mutations.createLocation and returns the result", async () => {
  const input = { shopId: "123" };
  const result = { success: true };
  mockContext.validatePermissions.mockResolvedValue(Promise.resolve());
  mockContext.mutations = {
    createLocation: jest.fn().mockName("mutations.createLocation").mockReturnValueOnce(Promise.resolve(result))
  };

  const createdLocation = await createLocation(null, { input }, mockContext);

  expect(createdLocation).toEqual(result);
});
