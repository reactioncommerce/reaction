import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import applyAction from "./applyAction";

test("should apply action to cart", async () => {
  const testAction = jest.fn().mockName("test-action");
  const enhancedCart = {
    _id: "cartId"
  };
  const promotion = {
    actions: [{ actionKey: "test" }]
  };

  applyAction(mockContext, enhancedCart, {
    actionHandleByKey: { test: { handler: testAction } },
    promotion
  });

  expect(testAction).toHaveBeenCalledWith(mockContext, enhancedCart, { promotion, actionParameters: undefined });
});
