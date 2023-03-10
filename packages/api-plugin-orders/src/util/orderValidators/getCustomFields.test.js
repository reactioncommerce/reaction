/* eslint-disable require-jsdoc */
import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import getCustomFields from "./getCustomFields.js";

test("should return original fields if there are NO functions defined", async () => {
  mockContext.getFunctionsOfType = jest.fn().mockReturnValueOnce([]);

  const orderInput = { orderId: "order123" };
  const customFieldsFromClient = { customField1: "customValue1" };
  const result = await getCustomFields(mockContext, customFieldsFromClient, orderInput);
  expect(result).toEqual({ customField1: "customValue1" });
});

test("should return transformed fields if there are functions defined", async () => {
  mockContext.getFunctionsOfType = jest.fn().mockReturnValueOnce([
    jest.fn().mockName("transformCustomOrderFields").mockReturnValueOnce(Promise.resolve({ customField1: "customValue1", customField2: "customValue2" }))
  ]);

  const orderInput = { orderId: "order123" };
  const customFieldsFromClient = { customField1: "customValue1" };
  const result = await getCustomFields(mockContext, customFieldsFromClient, orderInput);
  expect(result).toEqual({ customField1: "customValue1", customField2: "customValue2" });
});
