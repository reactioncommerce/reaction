/* eslint camelcase: 0 */
import refunds from "./refunds";
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
  await expect(refunds(mockContext, { orderId: null, shopId: order.shopId, token: null })).rejects.toThrowErrorMatchingSnapshot();
});

test("throws if shopId isn't supplied", async () => {
  mockContext.userHasPermission.mockReturnValueOnce(true);
  await expect(refunds(mockContext, { orderId: order._id, shopId: null, token: null })).rejects.toThrowErrorMatchingSnapshot();
});

test("throws if the order doesn't exist", async () => {
  mockContext.userHasPermission.mockReturnValueOnce(true);
  mockContext.collections.Orders.findOne.mockReturnValueOnce(Promise.resolve(null));

  await expect(refunds(mockContext, {
    orderId: "order1",
    shopId: order.shopId
  })).rejects.toThrowErrorMatchingSnapshot();
});

test("throws if permission check fails", async () => {
  mockContext.userHasPermission.mockReturnValueOnce(false);
  mockContext.collections.Orders.findOne.mockReturnValueOnce(Promise.resolve(order));

  await expect(refunds(mockContext, {
    orderId: order._id,
    shopId: order.shopId
  })).rejects.toThrowErrorMatchingSnapshot();

  expect(mockContext.userHasPermission).toHaveBeenCalledWith(["orders", "order/fulfillment", "order/view"], "SHOP_ID");
});
