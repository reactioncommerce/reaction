import qualifiers from "../qualifiers/index.js";
import canBeApplied from "./canBeApplied.js";

const promotion = {
  _id: "test id",
  actions: [{ actionKey: "test" }],
  triggers: [{ triggerKey: "test", triggerParameters: { name: "test trigger" } }],
  stackAbility: "none"
};

const context = {
  promotions: {
    qualifiers
  }
};

test("should return true when the cart don't have promotion already applied", async () => {
  const cart = {
    _id: "cartId"
  };
  // when appliedPromotions is undefined
  const { qualifies } = await canBeApplied(context, cart.appliedPromotions, promotion);
  expect(qualifies).toBeTruthy();

  // when appliedPromotions is empty
  cart.appliedPromotions = [];
  expect(canBeApplied(cart.appliedPromotions, promotion));
});

test("should return false when cart has first promotion applied with stackAbility is none", async () => {
  const cart = {
    _id: "cartId",
    appliedPromotions: [promotion]
  };
  const secondPromotion = {
    ...promotion,
    _id: "promotion 2",
    stackAbility: "all"
  };

  const { qualifies, reason } = await canBeApplied(context, cart.appliedPromotions, secondPromotion);
  expect(qualifies).toBe(false);
  expect(reason).toEqual("Cart disqualified from promotion because stack ability is none");
});

test("should return false when the 2nd promotion has stackAbility is none", async () => {
  const cart = {
    _id: "cartId",
    appliedPromotions: [promotion]
  };
  const secondPromotion = {
    ...promotion,
    _id: "promotion 2",
    stackAbility: "none"
  };
  const { qualifies, reason } = await canBeApplied(context, cart.appliedPromotions, secondPromotion);
  expect(qualifies).toBe(false);
  expect(reason).toEqual("Cart disqualified from promotion because stack ability is none");
});

test("should return true when stack ability is set to all", async () => {
  promotion.stackAbility = "all";
  const cart = {
    _id: "cartId",
    appliedPromotions: [promotion]
  };
  const secondPromotion = {
    ...promotion,
    _id: "promotion 2"
  };
  const { qualifies, reason } = await canBeApplied(context, cart.appliedPromotions, secondPromotion);
  expect(qualifies).toBe(true);
  expect(reason).toEqual("");
});
