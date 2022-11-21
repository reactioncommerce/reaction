import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import checkStackAbility from "./checkStackAbility.js";

const testPromotion = {
  _id: "test id",
  actions: [{ actionKey: "test" }],
  triggers: [{ triggerKey: "test", triggerParameters: { name: "test trigger" } }],
  stackAbility: {
    key: "none",
    parameters: {}
  }
};

beforeEach(() => {
  jest.clearAllMocks();
});

test("checkStackAbility: should return true when appliedPromotions is not yet", async () => {
  const appliedPromotions = [];
  const promotion = { stackAbility: { key: "all", parameters: {} } };
  const stackAbilityByKey = { all: { canBeApplied: jest.fn().mockReturnValue(true) } };

  const result = await checkStackAbility(mockContext, {}, { appliedPromotions, promotion, stackAbilityByKey });

  expect(result).toBe(true);
});

test("checkStackAbility: should return true when promotion can be applied", async () => {
  const appliedPromotions = [{ ...testPromotion, stackAbility: { key: "all", parameters: {} } }];
  const promotion = { stackAbility: { key: "all", parameters: {} } };
  const stackAbilityByKey = { all: { handler: jest.fn().mockReturnValue(true) }, none: { handler: jest.fn().mockReturnValue(false) } };

  const result = await checkStackAbility(mockContext, {}, { appliedPromotions, promotion, stackAbilityByKey });

  expect(result).toBe(true);
});

test("checkStackAbility: should return false when promotion can not be applied", async () => {
  const appliedPromotions = [{ ...testPromotion, stackAbility: { key: "none", parameters: {} } }];
  const promotion = { stackAbility: { key: "none", parameters: {} } };
  const stackAbilityByKey = { all: { handler: jest.fn().mockReturnValue(true) }, none: { handler: jest.fn().mockReturnValue(false) } };

  const result = await checkStackAbility(mockContext, {}, { appliedPromotions, promotion, stackAbilityByKey });

  expect(result).toBe(false);
});
