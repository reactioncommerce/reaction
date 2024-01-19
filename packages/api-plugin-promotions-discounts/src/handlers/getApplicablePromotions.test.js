import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import getApplicablePromotions from "./getApplicablePromotions.js";
import getPromotionCombinations from "./getPromotionCombinations.js";
import getHighestCombination from "./getHighestCombination.js";

jest.mock("./getPromotionCombinations.js");
jest.mock("./getHighestCombination.js");

const promo1 = { _id: "1", promotionType: "order-discount", actions: [{ actionParameters: { discountCalculationMethod: "flat" } }] };
const promo2 = { _id: "2", promotionType: "item-discount", actions: [{ actionParameters: { discountCalculationMethod: "percentage" } }] };
const promo3 = { _id: "3", promotionType: "item-discount", actions: [{ actionParameters: { discountCalculationMethod: "fixed" } }] };
const promo4 = { _id: "4", promotionType: "order-discount", actions: [{ actionParameters: { discountCalculationMethod: "fixed" } }] };
const promo5 = { _id: "5", promotionType: "order-discount", actions: [{ actionParameters: { discountCalculationMethod: "flat" } }] };
const promo6 = { _id: "6", promotionType: "shipping-discount", actions: [{ actionParameters: { discountCalculationMethod: "flat" } }] };

test("getApplicablePromotions returns correct promotions", async () => {
  const promotions = [promo1, promo2, promo3, promo4, promo5, promo6];

  const cart = {
    _id: "cartId"
  };

  const highestPromotions = [promo1, promo3, promo4];
  const combinations = [[promo1, promo2], [promo1, promo3, promo4], [promo5], [promo6]];
  getPromotionCombinations.mockReturnValueOnce(combinations);
  getHighestCombination.mockReturnValueOnce(highestPromotions);

  const applicablePromotions = await getApplicablePromotions(mockContext, cart, promotions);

  const sortedPromotionsWithoutShippingDiscount = [promo1, promo5, promo2, promo3, promo4];
  expect(getPromotionCombinations).toHaveBeenCalledWith(mockContext, cart, sortedPromotionsWithoutShippingDiscount);
  expect(getHighestCombination).toHaveBeenCalledWith(mockContext, cart, combinations);

  expect(applicablePromotions).toEqual([...highestPromotions, promo6]);
});
