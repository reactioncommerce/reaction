import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import updateStandardCoupon from "./updateStandardCoupon.js";

test("throws if permission check fails", async () => {
  const input = { name: "Test coupon", code: "CODE" };
  mockContext.validatePermissions.mockResolvedValue(Promise.reject(new Error("Access Denied")));

  try {
    await updateStandardCoupon(null, { input }, mockContext);
  } catch (error) {
    expect(error.message).toEqual("Access Denied");
  }
});

test("calls mutations.updateStandardCoupon and returns the result", async () => {
  const input = { name: "Test coupon", code: "CODE", couponId: "testId" };
  const result = { _id: "123" };
  mockContext.validatePermissions.mockResolvedValue(Promise.resolve());
  mockContext.mutations = {
    updateStandardCoupon: jest.fn().mockName("mutations.updateStandardCoupon").mockReturnValueOnce(Promise.resolve(result))
  };

  const createdCoupon = await updateStandardCoupon(null, { input }, mockContext);

  expect(createdCoupon).toEqual(result);
});
