import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import archiveCoupon from "./archiveCoupon.js";

test("throws if validation check fails", async () => {
  const input = { shopId: "abc" };

  try {
    await archiveCoupon(mockContext, input);
  } catch (error) {
    expect(error.error).toEqual("validation-error");
  }
});

test("should call mutations.archiveCoupon and return the result", async () => {
  const input = { shopId: "abc", couponId: "123" };
  mockContext.collections = {
    Coupons: {
      findOneAndUpdate: jest.fn().mockReturnValueOnce(Promise.resolve({
        modifiedCount: 1,
        value: {
          _id: "123",
          shopId: "abc"
        }
      }))
    }
  };

  const result = await archiveCoupon(mockContext, input);

  expect(result).toEqual({
    success: true,
    coupon: {
      _id: "123",
      shopId: "abc"
    }
  });
});
