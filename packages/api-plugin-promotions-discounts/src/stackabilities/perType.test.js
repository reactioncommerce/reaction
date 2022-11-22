import perType from "./perType.js";

test("should return true when the promotion is not include discount action", async () => {
  const promotion = {
    actions: [{ actionKey: "offers", actionParameters: { type: "some-other-action" } }]
  };

  const appliedPromotion = {
    actions: [{ actionKey: "offers", actionParameters: { type: "some-other-action" } }]
  };

  expect(await perType.handler(null, null, { promotion, appliedPromotion })).toBe(true);
});

test("should return true when the appliedPromotion and promotion are not same discount type", async () => {
  const promotion = {
    actions: [{ actionKey: "discounts", actionParameters: { type: "discounts", discountType: "some-discount-type" } }]
  };

  const appliedPromotion = {
    actions: [{ actionKey: "discounts", actionParameters: { type: "discounts", discountType: "some-other-discount-type" } }]
  };

  expect(await perType.handler(null, null, { promotion, appliedPromotion })).toBe(true);
});

test("should return false when the appliedPromotion and promotion are same discount type", async () => {
  const promotion = {
    actions: [{ actionKey: "discounts", actionParameters: { type: "discounts", discountType: "some-discount-type" } }]
  };

  const appliedPromotion = {
    actions: [{ actionKey: "discounts", actionParameters: { type: "discounts", discountType: "some-discount-type" } }]
  };

  expect(await perType.handler(null, null, { promotion, appliedPromotion })).toBe(false);
});
