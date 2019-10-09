/* eslint camelcase: 0 */
import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import refundsByPaymentId from "./refundsByPaymentId.js";

mockContext.queries.getPaymentMethodConfigByName = jest.fn().mockName("getPaymentMethodConfigByName").mockImplementation(() => ({
  functions: {
    listRefunds: async () => [{
      _id: "refundId",
      type: "refund",
      amount: 19.99,
      currency: "usd"
    }]
  }
}));

beforeEach(() => {
  jest.clearAllMocks();
});

const order = {
  _id: "order1",
  payments: [
    {
      _id: "payment1"
    }, {
      _id: "payment2"
    }
  ],
  shopId: "SHOP_ID"
};

test("throws if orderId isn't supplied", async () => {
  mockContext.userHasPermission.mockReturnValueOnce(true);
  await expect(refundsByPaymentId(mockContext, { orderId: null, paymentId: order.payments[0]._id, shopId: order.shopId, token: null })).rejects.toThrowErrorMatchingSnapshot(); // eslint-disable-line max-len
});

test("throws if paymentId isn't supplied", async () => {
  mockContext.userHasPermission.mockReturnValueOnce(true);
  await expect(refundsByPaymentId(mockContext, { orderId: order._id, paymentId: null, shopId: order.shopId, token: null })).rejects.toThrowErrorMatchingSnapshot(); // eslint-disable-line max-len
});

test("throws if shopId isn't supplied", async () => {
  mockContext.userHasPermission.mockReturnValueOnce(true);
  await expect(refundsByPaymentId(mockContext, { orderId: order._id, shopId: null, token: null })).rejects.toThrowErrorMatchingSnapshot();
});

test("throws if the order doesn't exist", async () => {
  mockContext.userHasPermission.mockReturnValueOnce(true);
  mockContext.collections.Orders.findOne.mockReturnValueOnce(Promise.resolve(null));

  await expect(refundsByPaymentId(mockContext, {
    orderId: "order1",
    paymentId: order.payments[0]._id,
    shopId: order.shopId
  })).rejects.toThrowErrorMatchingSnapshot();
});

test("throws if the payment doesn't exist", async () => {
  mockContext.userHasPermission.mockReturnValueOnce(true);
  mockContext.collections.Orders.findOne.mockReturnValueOnce(Promise.resolve(order));

  await expect(refundsByPaymentId(mockContext, {
    orderId: "order1",
    paymentId: "payment3",
    shopId: order.shopId
  })).rejects.toThrowErrorMatchingSnapshot();
});

test("should call refunds with the proper parameters and return a list of refunds for a payment", async () => {
  mockContext.userHasPermission.mockReturnValueOnce(true);
  mockContext.collections.Orders.findOne.mockReturnValueOnce(Promise.resolve(order));

  const result = await refundsByPaymentId(mockContext, {
    orderId: order._id,
    paymentId: order.payments[0]._id,
    shopId: order.shopId
  });

  expect(result[0].type).toBe("refund");
  expect(result[0].amount).toBe(19.99);
  expect(result[0].currency).toBe("usd");
});
