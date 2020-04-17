/* eslint camelcase: 0 */
import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import ReactionError from "@reactioncommerce/reaction-error";
import Factory from "../tests/factory.js";
import createRefund from "./createRefund.js";

beforeEach(() => {
  jest.resetAllMocks();
});

const fakeOrder = {
  _id: "order1",
  payments: [
    {
      _id: "payment1",
      name: "iou_example"
    },
    {
      _id: "payment2",
      name: "iou_example"
    }
  ],
  shipping: [
    Factory.OrderFulfillmentGroup.makeOne({
      items: [
        Factory.OrderItem.makeOne({
          _id: "abc",
          quantity: 1,
          price: {
            amount: 1,
            currencyCode: "USD"
          },
          subtotal: 1,
          workflow: {
            status: "new",
            workflow: ["new"]
          }
        })
      ],
      workflow: {
        status: "new",
        workflow: ["new"]
      }
    })
  ],
  shopId: "SHOP_ID",
  workflow: {
    status: "new",
    workflow: ["new"]
  }
};

test("throws if permission check fails", async () => {
  mockContext.collections.Orders.findOne.mockReturnValueOnce(Promise.resolve(fakeOrder));

  mockContext.validatePermissions.mockImplementation(() => {
    throw new ReactionError("access-denied", "Access Denied");
  });

  await expect(createRefund(mockContext, {
    amount: 10,
    orderId: "order1",
    paymentId: "payment1",
    reason: "Customer was unsatisfied with purchase"
  })).rejects.toThrowErrorMatchingSnapshot();

  expect(mockContext.validatePermissions).toHaveBeenCalledWith(
    "reaction:legacy:orders:order1",
    "refund:payment",
    { shopId: "SHOP_ID" }
  );
});

test("throws if amount isn't supplied", async () => {
  await expect(createRefund(mockContext, {
    amount: null,
    orderId: fakeOrder._id,
    paymentId: fakeOrder.payments[0]._id,
    reason: "Customer was unsatisfied with purchase"
  })).rejects.toThrowErrorMatchingSnapshot();
});

test("throws if orderId isn't supplied", async () => {
  await expect(createRefund(mockContext, {
    amount: 10,
    orderId: null,
    paymentId: fakeOrder.payments[0]._id,
    reason: "Customer was unsatisfied with purchase"
  })).rejects.toThrowErrorMatchingSnapshot();
});

test("throws if paymentId isn't supplied", async () => {
  await expect(createRefund(mockContext, {
    amount: 10,
    orderId: fakeOrder._id,
    paymentId: null,
    reason: "Customer was unsatisfied with purchase"
  })).rejects.toThrowErrorMatchingSnapshot();
});

test("throws if payment doesn't exist", async () => {
  mockContext.collections.Orders.findOne.mockReturnValueOnce(Promise.resolve(fakeOrder));

  mockContext.validatePermissions.mockReturnValueOnce(Promise.resolve(null));

  await expect(createRefund(mockContext, {
    amount: 10,
    orderId: fakeOrder._id,
    paymentId: "payment3",
    reason: "Customer was unsatisfied with purchase"
  })).rejects.toThrowErrorMatchingSnapshot();
});

test("throws if amount is less than $0.01", async () => {
  mockContext.collections.Orders.findOne.mockReturnValueOnce(Promise.resolve(fakeOrder));

  mockContext.validatePermissions.mockReturnValueOnce(Promise.resolve(null));

  await expect(createRefund(mockContext, {
    amount: 0,
    orderId: fakeOrder._id,
    paymentId: "payment3",
    reason: "Customer was unsatisfied with purchase"
  })).rejects.toThrowErrorMatchingSnapshot();
});
