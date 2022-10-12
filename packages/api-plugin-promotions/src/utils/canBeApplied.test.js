import canBeApplied from "./canBeApplied.js";

const promotion = {
  _id: "test id",
  actions: [{ actionKey: "test" }],
  triggers: [{ triggerKey: "test", triggerParameters: { name: "test trigger" } }],
  stackAbility: "none"
};

test("should return true when the cart don't have promotion already applied", () => {
  const cart = {
    _id: "cartId"
  };

  // when appliedPromotions is undefined
  expect(canBeApplied(cart.appliedPromotions, promotion));

  // when appliedPromotions is empty
  cart.appliedPromotions = [];
  expect(canBeApplied(cart.appliedPromotions, promotion));
});

test("should return false when cart has first promotion applied with stackAbility is none", () => {
  const cart = {
    _id: "cartId",
    appliedPromotions: [promotion]
  };
  const secondPromotion = {
    ...promotion,
    _id: "promotion 2",
    stackAbility: "all"
  };
  expect(canBeApplied(cart.appliedPromotions, secondPromotion)).toBe(false);
});

test("should return false when the 2nd promotion has stackAbility is none", () => {
  const cart = {
    _id: "cartId",
    appliedPromotions: [promotion]
  };
  const secondPromotion = {
    ...promotion,
    _id: "promotion 2",
    stackAbility: "none"
  };
  expect(canBeApplied(cart.appliedPromotions, secondPromotion)).toBe(false);
});

test("should return true when stack ability is set to all", () => {
  promotion.stackAbility = "all";
  const cart = {
    _id: "cartId",
    appliedPromotions: [promotion]
  };
  const secondPromotion = {
    ...promotion,
    _id: "promotion 2"
  };
  expect(canBeApplied(cart.appliedPromotions, secondPromotion)).toBe(true);
});
