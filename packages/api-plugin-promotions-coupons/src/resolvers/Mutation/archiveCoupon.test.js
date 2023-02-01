import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import archiveCoupon from "./archiveCoupon.js";

test("throws if permission check fails", async () => {
  const input = { name: "Test coupon", code: "CODE" };
  mockContext.validatePermissions.mockResolvedValue(Promise.reject(new Error("Access Denied")));

  try {
    await archiveCoupon(null, { input }, mockContext);
  } catch (error) {
    expect(error.message).toEqual("Access Denied");
  }
});

test("calls mutations.archiveCoupon and returns the result", async () => {
  const input = { couponId: "123" };
  const result = { success: true };
  mockContext.validatePermissions.mockResolvedValue(Promise.resolve());
  mockContext.mutations = {
    archiveCoupon: jest.fn().mockName("mutations.archiveCoupon").mockReturnValueOnce(Promise.resolve(result))
  };

  const createdCoupon = await archiveCoupon(null, { input }, mockContext);

  expect(createdCoupon).toEqual(result);
});
