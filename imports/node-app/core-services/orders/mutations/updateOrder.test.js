import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import Factory from "/imports/test-utils/helpers/factory"; // TODO: remove cross-plugin import (https://github.com/reactioncommerce/reaction/issues/5653)
import updateOrder from "./updateOrder.js";

beforeEach(() => {
  jest.resetAllMocks();
});

test("throws if orderId isn't supplied", async () => {
  await expect(updateOrder(mockContext, {})).rejects.toThrowErrorMatchingSnapshot();
});

test("throws if the order doesn't exist", async () => {
  mockContext.collections.Orders.findOne.mockReturnValueOnce(Promise.resolve(null));

  await expect(updateOrder(mockContext, {
    orderId: "order1"
  })).rejects.toThrowErrorMatchingSnapshot();
});

test("throws if permission check fails", async () => {
  mockContext.collections.Orders.findOne.mockReturnValueOnce(Promise.resolve({
    shipping: [
      {
        items: []
      }
    ],
    shopId: "SHOP_ID"
  }));

  mockContext.userHasPermission.mockReturnValueOnce(false);

  await expect(updateOrder(mockContext, {
    orderId: "order1"
  })).rejects.toThrowErrorMatchingSnapshot();

  expect(mockContext.userHasPermission).toHaveBeenCalledWith(["orders", "order/fulfillment"], "SHOP_ID");
});

test("skips permission check if context.isInternalCall", async () => {
  mockContext.collections.Orders.findOne.mockReturnValueOnce(Promise.resolve({
    shipping: [
      Factory.OrderFulfillmentGroup.makeOne({
        items: Factory.OrderItem.makeMany(2)
      }),
      Factory.OrderFulfillmentGroup.makeOne({
        items: Factory.OrderItem.makeMany(2)
      })
    ],
    shopId: "SHOP_ID",
    workflow: {
      status: "new",
      workflow: ["new"]
    }
  }));

  mockContext.collections.Orders.findOneAndUpdate.mockReturnValueOnce(Promise.resolve({
    modifiedCount: 1,
    value: {}
  }));

  mockContext.isInternalCall = true;

  await updateOrder(mockContext, {
    orderId: "order1"
  });

  delete mockContext.isInternalCall;

  expect(mockContext.userHasPermission).not.toHaveBeenCalled();
});


test("skips update if one is not necessary", async () => {
  mockContext.collections.Orders.findOne.mockReturnValueOnce(Promise.resolve({
    customFields: {
      foo: "boo"
    },
    email: "old@email.com",
    shipping: [
      Factory.OrderFulfillmentGroup.makeOne({
        items: Factory.OrderItem.makeMany(2)
      })
    ],
    shopId: "SHOP_ID",
    workflow: {
      status: "new",
      workflow: ["new"]
    }
  }));

  mockContext.userHasPermission.mockReturnValueOnce(true);

  await updateOrder(mockContext, { orderId: "order1" });

  expect(mockContext.collections.Orders.findOneAndUpdate).not.toHaveBeenCalled();
});

test("updates an order", async () => {
  mockContext.collections.Orders.findOne.mockReturnValueOnce(Promise.resolve({
    customFields: {
      foo: "boo"
    },
    email: "old@email.com",
    shipping: [
      Factory.OrderFulfillmentGroup.makeOne({
        items: Factory.OrderItem.makeMany(2)
      })
    ],
    shopId: "SHOP_ID",
    workflow: {
      status: "new",
      workflow: ["new"]
    }
  }));

  mockContext.userHasPermission.mockReturnValueOnce(true);

  mockContext.collections.Orders.findOneAndUpdate.mockReturnValueOnce(Promise.resolve({
    modifiedCount: 1,
    value: {}
  }));

  await updateOrder(mockContext, {
    customFields: {
      foo: "bar"
    },
    email: "new@email.com",
    orderId: "order1",
    status: "NEW_STATUS"
  });

  expect(mockContext.collections.Orders.findOneAndUpdate).toHaveBeenCalledWith(
    { _id: "order1" },
    {
      $set: {
        "customFields": {
          foo: "bar"
        },
        "email": "new@email.com",
        "updatedAt": jasmine.any(Date),
        "workflow.status": "NEW_STATUS"
      },
      $push: {
        "workflow.workflow": "NEW_STATUS"
      }
    },
    { returnOriginal: false }
  );
});
