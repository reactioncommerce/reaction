import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import updateLocation from "./updateLocation.js";

test("throws if permission check fails", async () => {
  const input = { _id: "123", shopId: "123", name: "Test location" };
  mockContext.validatePermissions.mockResolvedValue(Promise.reject(new Error("Access Denied")));

  try {
    await updateLocation(null, { input }, mockContext);
  } catch (error) {
    expect(error.message).toEqual("Access Denied");
  }
});

test("calls mutations.updateLocation and returns the result", async () => {
  const input = { locationId: "123" };
  const result = { success: true };
  mockContext.validatePermissions.mockResolvedValue(Promise.resolve());
  mockContext.mutations = {
    updateLocation: jest.fn().mockName("mutations.updateLocation").mockReturnValueOnce(Promise.resolve(result))
  };

  const updatedLocation = await updateLocation(null, { input }, mockContext);

  expect(updatedLocation).toEqual(result);
});
