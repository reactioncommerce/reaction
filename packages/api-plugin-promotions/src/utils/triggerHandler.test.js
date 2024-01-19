import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import triggerHandler from "./triggerHandler.js";

test("actionHandler returns true when promotion passes the trigger", async () => {
  const enhancedCart = {};
  const promotion = {
    _id: "promotionId",
    triggers: [
      {
        triggerKey: "test",
        triggerParameters: {}
      }
    ]
  };
  const trigger = jest.fn().mockName("triggerHandler").mockResolvedValue(true);

  mockContext.promotions = {
    triggers: [{ key: "test", handler: trigger }]
  };

  const result = await triggerHandler(mockContext, enhancedCart, promotion);
  expect(trigger).toHaveBeenCalledWith(mockContext, enhancedCart, { promotion, triggerParameters: {} });
  expect(result).toEqual(true);
});

test("actionHandler returns false when promotion fails the trigger", async () => {
  const enhancedCart = {};
  const promotion = {
    _id: "promotionId",
    triggers: [
      {
        triggerKey: "test",
        triggerParameters: {}
      }
    ]
  };
  const trigger = jest.fn().mockName("triggerHandler").mockResolvedValue(false);

  mockContext.promotions = {
    triggers: [{ key: "test", handler: trigger }]
  };

  const result = await triggerHandler(mockContext, enhancedCart, promotion);
  expect(trigger).toHaveBeenCalledWith(mockContext, enhancedCart, { promotion, triggerParameters: {} });
  expect(result).toEqual(false);
});
