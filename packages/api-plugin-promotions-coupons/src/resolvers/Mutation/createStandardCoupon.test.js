import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import createStandardCoupon from "./createStandardCoupon.js";

test("throws if permission check fails", async () => {
  const input = { name: "Test coupon", code: "CODE" };
  mockContext.validatePermissions.mockResolvedValue(Promise.reject(new Error("Access Denied")));

  try {
    await createStandardCoupon(null, { input }, mockContext);
  } catch (error) {
    expect(error.message).toEqual("Access Denied");
  }
});

test("calls mutations.createStandardCoupon and returns the result", async () => {
  const input = { name: "Test coupon", code: "CODE" };
  const result = { _id: "123" };
  mockContext.validatePermissions.mockResolvedValue(Promise.resolve());
  mockContext.mutations = {
    createStandardCoupon: jest.fn().mockName("mutations.createStandardCoupon").mockReturnValueOnce(Promise.resolve(result))
  };

  const createdCoupon = await createStandardCoupon(null, { input }, mockContext);

  expect(createdCoupon).toEqual(result);
});
