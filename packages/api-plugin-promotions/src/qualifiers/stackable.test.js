import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import stackable from "./stackable.js";

const testPromotion = {
  _id: "test id",
  actions: [{ actionKey: "test" }],
  triggers: [{ triggerKey: "test", triggerParameters: { name: "test trigger" } }],
  stackability: {
    key: "none",
    parameters: {}
  }
};

mockContext.promotions = {
  stackabilities: [
    { key: "all", handler: jest.fn().mockReturnValue(true) },
    { key: "none", handler: jest.fn().mockReturnValue(false) }
  ]
};

beforeEach(() => {
  jest.clearAllMocks();
});

test("should return true when promotion can be applied", async () => {
  const appliedPromotions = [{ ...testPromotion, stackability: { key: "all", parameters: {} } }];
  const promotion = { stackability: { key: "all", parameters: {} } };

  const result = await stackable(mockContext, {}, { appliedPromotions, promotion });

  expect(result.qualifies).toBe(true);
});

test("should return false when promotion can not be applied", async () => {
  const appliedPromotions = [{ ...testPromotion, stackability: { key: "none", parameters: {} } }];
  const promotion = { stackability: { key: "none", parameters: {} } };

  const result = await stackable(mockContext, {}, { appliedPromotions, promotion });

  expect(result.qualifies).toBe(false);
});
