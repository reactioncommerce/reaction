import ReactionError from "@reactioncommerce/reaction-error";
import mockContext from "/imports/test-utils/helpers/mockContext";
import exampleListRefunds from "./exampleListRefunds";
import { ExampleApi } from "./exampleapi";

jest.mock(
  "./exampleapi",
  () => ({
    ExampleApi: {
      refunds: jest.fn()
    }
  })
);

const paymentMethod = {
  transactionId: "abc1234"
};

test("should call ExampleApi with transaction ID and return correct result", async () => {
  ExampleApi.refunds.mockImplementation(() => ({ refunds: [] }));
  const result = exampleListRefunds(mockContext, paymentMethod);
  expect(ExampleApi.refunds).toHaveBeenCalledWith(paymentMethod);
  expect(result).toEqual([]);
});

test("should throw an error if transaction ID is not found", async () => {
  ExampleApi.refunds.mockImplementation(() => {
    throw new ReactionError("not-found", "Not Found");
  });
  let errorType;
  try {
    exampleListRefunds(mockContext, paymentMethod);
  } catch (error) {
    errorType = error.error;
  }
  expect(errorType).toBe("not-found");
});
