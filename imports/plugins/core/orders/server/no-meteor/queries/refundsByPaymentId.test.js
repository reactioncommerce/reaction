/* eslint camelcase: 0 */
import refundsByPaymentId from "./refundsByPaymentId";
import mockContext from "/imports/test-utils/helpers/mockContext";

beforeEach(() => {
  jest.resetAllMocks();
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
  await expect(refundsByPaymentId(mockContext, { orderId: order._id, paymentId: null, shopId: order.shopId, token: null })).rejects.toThrowErrorMatchingSnapshot();
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

test("throws if permission check fails", async () => {
  mockContext.userHasPermission.mockReturnValueOnce(false);
  mockContext.collections.Orders.findOne.mockReturnValueOnce(Promise.resolve(order));

  await expect(refundsByPaymentId(mockContext, {
    orderId: order._id,
    paymentId: order.payments[0]._id,
    shopId: order.shopId
  })).rejects.toThrowErrorMatchingSnapshot();

  expect(mockContext.userHasPermission).toHaveBeenCalledWith(["orders", "order/fulfillment", "order/view"], "SHOP_ID");
});
