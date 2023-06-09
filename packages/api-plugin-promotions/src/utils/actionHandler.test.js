import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import actionHandler from "./actionHandler.js";

test("actionHandler returns the correct result", async () => {
  const enhancedCart = {};
  const promotion = {
    _id: "promotionId",
    actions: [
      {
        actionKey: "test",
        actionParameters: {}
      }
    ]
  };
  const action = jest.fn().mockName("actionHandler").mockResolvedValue({ affected: true, temporaryAffected: false });

  mockContext.promotions = {
    actions: [{ key: "test", handler: action }]
  };

  const result = await actionHandler(mockContext, enhancedCart, promotion);
  expect(action).toHaveBeenCalledWith(mockContext, enhancedCart, { promotion, ...promotion.actions[0] });
  expect(result).toEqual({
    affected: true,
    temporaryAffected: false,
    rejectedReason: undefined
  });
});
