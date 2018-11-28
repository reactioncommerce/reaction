import ReactionError from "@reactioncommerce/reaction-error";
import mockContext from "/imports/test-utils/helpers/mockContext";
import exampleCreateRefund from "./exampleCreateRefund";
import { ExampleApi } from "./exampleapi";

jest.mock(
  "./exampleapi",
  () => ({
    ExampleApi: {
      refund: jest.fn()
    }
  })
);

const transactionId = "abc1234";
const amount = 20;

const paymentMethod = {
  transactionId
};

test("should call ExampleApi with transaction ID and return correct result", async () => {
  const refundResult = { success: true };
  ExampleApi.refund.mockImplementation(() => (refundResult));
  const result = exampleCreateRefund(mockContext, paymentMethod, amount);
  expect(ExampleApi.refund).toHaveBeenCalledWith({ transactionId, amount });
  expect(result.saved).toBe(true);
});

test("should throw an error if transaction ID is not found", async () => {
  ExampleApi.refund.mockImplementation(() => {
    throw new ReactionError("not-found", "Not Found");
  });
  let errorType;
  try {
    exampleCreateRefund(mockContext, paymentMethod, amount);
  } catch (error) {
    errorType = error.error;
  }
  expect(errorType).toBe("not-found");
});
