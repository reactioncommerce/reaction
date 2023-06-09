import qualifiers from "../qualifiers/index.js";
import stackabilities from "../stackabilities/index.js";
import canBeApplied from "./canBeApplied.js";

const promotion = {
  _id: "test id",
  actions: [{ actionKey: "test" }],
  triggers: [{ triggerKey: "test", triggerParameters: { name: "test trigger" } }],
  stackability: { key: "none", parameters: {} }
};

const context = {
  promotions: {
    qualifiers,
    stackabilities
  }
};

test("should return true when the cart don't have promotion already applied", async () => {
  const cart = {
    _id: "cartId"
  };
  // when appliedPromotions is undefined
  const { qualifies } = await canBeApplied(context, cart, { appliedPromotions: [], promotion });
  expect(qualifies).toBeTruthy();

  // when appliedPromotions is empty
  cart.appliedPromotions = [];
  expect(canBeApplied(context, cart, { appliedPromotions: [], promotion }));
});

test("should return false when cart has first promotion applied with stackability is none", async () => {
  const appliedPromotions = [promotion];
  const cart = {
    _id: "cartId",
    appliedPromotions
  };
  const secondPromotion = {
    ...promotion,
    _id: "promotion 2",
    stackability: { key: "all", parameters: {} }
  };

  const { qualifies, reason } = await canBeApplied(context, cart, { appliedPromotions, promotion: secondPromotion });
  expect(qualifies).toBe(false);
  expect(reason).toEqual("Cart disqualified from promotion because stackability is not stackable");
});

test("should return false when the 2nd promotion has stackAbility is none", async () => {
  const appliedPromotions = [promotion];
  const cart = {
    _id: "cartId",
    appliedPromotions
  };
  const secondPromotion = {
    ...promotion,
    _id: "promotion 2",
    stackability: { key: "none", parameters: {} }
  };
  const { qualifies, reason } = await canBeApplied(context, cart, { appliedPromotions, promotion: secondPromotion });
  expect(qualifies).toBe(false);
  expect(reason).toEqual("Cart disqualified from promotion because stackability is not stackable");
});

test("should return true when stackability is set to all", async () => {
  promotion.stackability.key = "all";
  const appliedPromotions = [promotion];
  const cart = {
    _id: "cartId",
    appliedPromotions
  };
  const secondPromotion = {
    ...promotion,
    _id: "promotion 2"
  };
  const { qualifies, reason } = await canBeApplied(context, cart, { appliedPromotions, promotion: secondPromotion });
  expect(qualifies).toBe(true);
  expect(reason).toEqual("");
});
