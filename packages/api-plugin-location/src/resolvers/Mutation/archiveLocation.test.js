import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import archiveLocation from "./archiveLocation.js";

test("throws if permission check fails", async () => {
  const input = { _id: "123", shopId: "123" };
  mockContext.validatePermissions.mockResolvedValue(Promise.reject(new Error("Access Denied")));

  try {
    await archiveLocation(null, { input }, mockContext);
  } catch (error) {
    expect(error.message).toEqual("Access Denied");
  }
});

test("calls mutations.archiveLocation and returns the result", async () => {
  const input = { locationId: "123" };
  const result = { success: true };
  mockContext.validatePermissions.mockResolvedValue(Promise.resolve());
  mockContext.mutations = {
    archiveLocation: jest.fn().mockName("mutations.archiveLocation").mockReturnValueOnce(Promise.resolve(result))
  };

  const createdCoupon = await archiveLocation(null, { input }, mockContext);

  expect(createdCoupon).toEqual(result);
});
1;
