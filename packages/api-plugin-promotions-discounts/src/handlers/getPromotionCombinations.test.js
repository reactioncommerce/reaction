import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import getPromotionCombinations from "./getPromotionCombinations.js";

const mockCart = {
  _id: "cartId"
};

test("should return the best promotions", async () => {
  const promotion1 = {
    _id: "promotionId1",
    triggerType: "implicit",
    discount: 2,
    type: "order",
    stackability: {
      key: "all"
    }
  };

  const promotion2 = {
    _id: "promotionId2",
    triggerType: "implicit",
    discount: 3,
    type: "item",
    stackability: {
      key: "none"
    }
  };

  const promotion3 = {
    _id: "promotionId3",
    triggerType: "explicit",
    discount: 4,
    type: "order",
    stackability: {
      key: "all"
    }
  };

  const mockPromotions = [promotion1, promotion2, promotion3];

  const stackabilities = {
    all: () => true,
    none: () => false
  };

  const stackabilityQualifier = (_, __, { appliedPromotions, promotion }) => {
    for (const appliedPromotion of appliedPromotions) {
      const result = stackabilities[promotion.stackability.key]();
      const appliedResult = stackabilities[appliedPromotion.stackability.key]();
      if (!result || !appliedResult) return { qualifies: false };
    }
    return { qualifies: true };
  };

  const canBeApplied = jest.fn().mockImplementation(stackabilityQualifier);

  mockContext.promotions = {
    enhancers: [],
    qualifiers: [],
    utils: {
      canBeApplied
    }
  };

  const result = await getPromotionCombinations(mockContext, mockCart, mockPromotions);
  expect(result).toEqual([[promotion2], [promotion3, promotion1]]);
});

test("should return the best promotions with four implicit promotions", async () => {
  const promotion1 = {
    _id: "promotionId1",
    triggerType: "implicit",
    discount: 2,
    type: "order",
    stackability: {
      key: "all"
    }
  };

  const promotion2 = {
    _id: "promotionId2",
    triggerType: "implicit",
    discount: 3,
    type: "item",
    stackability: {
      key: "all"
    }
  };

  const promotion3 = {
    _id: "promotionId3",
    triggerType: "implicit",
    discount: 4,
    type: "item",
    stackability: {
      key: "all"
    }
  };

  const promotion4 = {
    _id: "promotionId4",
    triggerType: "implicit",
    discount: 4,
    type: "item",
    stackability: {
      key: "per-type"
    }
  };

  const mockPromotions = [promotion1, promotion2, promotion3, promotion4];

  const stackabilities = {
    "all": () => true,
    "none": () => false,
    "per-type": (promo1, promo2) => promo1.type !== promo2.type
  };

  const stackabilityQualifier = (_, __, { appliedPromotions, promotion }) => {
    for (const appliedPromotion of appliedPromotions) {
      const result = stackabilities[promotion.stackability.key](appliedPromotion, promotion);
      const appliedResult = stackabilities[appliedPromotion.stackability.key](promotion, appliedPromotion);

      if (!result || !appliedResult) return { qualifies: false };
    }
    return { qualifies: true };
  };

  const canBeApplied = jest.fn().mockImplementation(stackabilityQualifier);

  mockContext.promotions = {
    enhancers: [],
    qualifiers: [],
    utils: {
      canBeApplied
    }
  };

  const result = await getPromotionCombinations(mockContext, mockCart, mockPromotions);
  expect(result).toEqual([
    [promotion1, promotion4],
    [promotion1, promotion2, promotion3]
  ]);
});

test("should return the best promotions with four implicit and two explicit promotions", async () => {
  const promotion1 = {
    _id: "promotionId1",
    triggerType: "implicit",
    discount: 2,
    type: "order",
    stackability: {
      key: "all"
    }
  };

  const promotion1ex = {
    _id: "promotionId1ex",
    triggerType: "explicit",
    discount: 2,
    type: "order",
    stackability: {
      key: "all"
    }
  };

  const promotion2 = {
    _id: "promotionId2",
    triggerType: "implicit",
    discount: 3,
    type: "item",
    stackability: {
      key: "all"
    }
  };

  const promotion2ex = {
    _id: "promotionId2ex",
    triggerType: "explicit",
    discount: 3,
    type: "item",
    stackability: {
      key: "all"
    }
  };

  const promotion3 = {
    _id: "promotionId3",
    triggerType: "implicit",
    discount: 4,
    type: "item",
    stackability: {
      key: "all"
    }
  };

  const promotion3ex = {
    _id: "promotionId3ex",
    triggerType: "implicit",
    discount: 4,
    type: "item",
    stackability: {
      key: "none"
    }
  };

  const promotion4 = {
    _id: "promotionId4",
    triggerType: "implicit",
    discount: 4,
    type: "item",
    stackability: {
      key: "per-type"
    }
  };

  const mockPromotions = [promotion1, promotion1ex, promotion2, promotion2ex, promotion3, promotion3ex, promotion4];

  const stackabilities = {
    "all": () => true,
    "none": () => false,
    "per-type": (promo1, promo2) => promo1.type !== promo2.type
  };

  const stackabilityQualifier = (_, __, { appliedPromotions, promotion }) => {
    for (const appliedPromotion of appliedPromotions) {
      const result = stackabilities[promotion.stackability.key](appliedPromotion, promotion);
      const appliedResult = stackabilities[appliedPromotion.stackability.key](promotion, appliedPromotion);
      if (!result || !appliedResult) return { qualifies: false };
    }
    return { qualifies: true };
  };

  const canBeApplied = jest.fn().mockImplementation(stackabilityQualifier);

  mockContext.promotions = {
    enhancers: [],
    qualifiers: [],
    utils: {
      canBeApplied
    }
  };

  const result = await getPromotionCombinations(mockContext, mockCart, mockPromotions);
  expect(result).toHaveLength(3);
  expect(result).toEqual([[promotion3ex], [promotion1ex, promotion2ex, promotion1, promotion2, promotion3], [promotion1, promotion4]]);
});
