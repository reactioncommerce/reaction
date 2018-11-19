import ReactionError from "@reactioncommerce/reaction-error";
import mockContext from "/imports/test-utils/helpers/mockContext";
import exampleCapturePayment from "./exampleCapturePayment";
import { ExampleApi } from "./exampleapi";

jest.mock(
  "./exampleapi",
  () => ({
    ExampleApi: {
      capture: jest.fn()
    }
  })
);

const transactionId = "abc1234";
const amount = 20;

const paymentMethod = {
  transactionId,
  amount
};

test("should call ExampleApi with transaction ID and return correct result", async () => {
  const captureResult = { success: true };
  ExampleApi.capture.mockImplementation(() => (captureResult));
  const result = exampleCapturePayment(mockContext, paymentMethod);
  expect(ExampleApi.capture).toHaveBeenCalledWith({ authorizationId: transactionId, amount });
  expect(result.saved).toBe(true);
});

test("should throw an error if transaction ID is not found", async () => {
  ExampleApi.capture.mockImplementation(() => {
    throw new ReactionError("not-found", "Not Found");
  });
  let errorType;
  try {
    exampleCapturePayment(mockContext, paymentMethod, amount);
  } catch (error) {
    errorType = error.error;
  }
  expect(errorType).toBe("not-found");
});
