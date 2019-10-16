import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import Factory from "/imports/test-utils/helpers/factory"; // TODO: remove cross-plugin import (https://github.com/reactioncommerce/reaction/issues/5653)
import updateOrderFulfillmentGroup from "./updateOrderFulfillmentGroup.js";

beforeEach(() => {
  jest.resetAllMocks();
});

test("throws if orderId isn't supplied", async () => {
  await expect(updateOrderFulfillmentGroup(mockContext, { orderFulfillmentGroupId: "123" })).rejects.toThrowErrorMatchingSnapshot();
});

test("throws if orderFulfillmentGroupId isn't supplied", async () => {
  await expect(updateOrderFulfillmentGroup(mockContext, { orderId: "123" })).rejects.toThrowErrorMatchingSnapshot();
});

test("throws if the order doesn't exist", async () => {
  mockContext.collections.Orders.findOne.mockReturnValueOnce(Promise.resolve(null));

  await expect(updateOrderFulfillmentGroup(mockContext, {
    orderId: "order1",
    orderFulfillmentGroupId: "123"
  })).rejects.toThrowErrorMatchingSnapshot();
});

test("throws if the order fulfillment group doesn't exist", async () => {
  mockContext.collections.Orders.findOne.mockReturnValueOnce(Promise.resolve({
    shipping: [
      {
        _id: "abc",
        items: []
      }
    ],
    shopId: "SHOP_ID"
  }));

  mockContext.userHasPermission.mockReturnValueOnce(true);

  await expect(updateOrderFulfillmentGroup(mockContext, {
    orderId: "order1",
    orderFulfillmentGroupId: "123"
  })).rejects.toThrowErrorMatchingSnapshot();
});

test("throws if permission check fails", async () => {
  mockContext.collections.Orders.findOne.mockReturnValueOnce(Promise.resolve({
    shipping: [
      {
        _id: "123",
        items: []
      }
    ],
    shopId: "SHOP_ID"
  }));

  mockContext.userHasPermission.mockReturnValueOnce(false);

  await expect(updateOrderFulfillmentGroup(mockContext, {
    orderId: "order1",
    orderFulfillmentGroupId: "123"
  })).rejects.toThrowErrorMatchingSnapshot();

  expect(mockContext.userHasPermission).toHaveBeenCalledWith(["orders", "order/fulfillment"], "SHOP_ID");
});

test("skips permission check if context.isInternalCall", async () => {
  mockContext.collections.Orders.findOne.mockReturnValueOnce(Promise.resolve({
    shipping: [
      Factory.OrderFulfillmentGroup.makeOne({
        _id: "123",
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

  await updateOrderFulfillmentGroup(mockContext, {
    orderId: "order1",
    orderFulfillmentGroupId: "123"
  });

  delete mockContext.isInternalCall;

  expect(mockContext.userHasPermission).not.toHaveBeenCalled();
});

test("skips update if one is not necessary", async () => {
  mockContext.collections.Orders.findOne.mockReturnValueOnce(Promise.resolve({
    shipping: [
      Factory.OrderFulfillmentGroup.makeOne({
        _id: "group1",
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

  await updateOrderFulfillmentGroup(mockContext, { orderId: "order1", orderFulfillmentGroupId: "group1" });

  expect(mockContext.collections.Orders.findOneAndUpdate).not.toHaveBeenCalled();
});

test("updates an order fulfillment group", async () => {
  mockContext.collections.Orders.findOne.mockReturnValueOnce(Promise.resolve({
    shipping: [
      Factory.OrderFulfillmentGroup.makeOne({
        _id: "group1",
        items: Factory.OrderItem.makeMany(2),
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
  }));

  mockContext.userHasPermission.mockReturnValueOnce(true);

  mockContext.collections.Orders.findOneAndUpdate.mockReturnValueOnce(Promise.resolve({
    modifiedCount: 1,
    value: {}
  }));

  await updateOrderFulfillmentGroup(mockContext, {
    orderId: "order1",
    orderFulfillmentGroupId: "group1",
    status: "NEW_STATUS",
    tracking: "TRACK_REF",
    trackingUrl: "http://track.me/TRACK_REF"
  });

  expect(mockContext.collections.Orders.findOneAndUpdate).toHaveBeenCalledWith(
    {
      "_id": "order1",
      "shipping._id": "group1"
    },
    {
      $set: {
        "shipping.$[group].tracking": "TRACK_REF",
        "shipping.$[group].trackingUrl": "http://track.me/TRACK_REF",
        "shipping.$[group].updatedAt": jasmine.any(Date),
        "shipping.$[group].workflow.status": "NEW_STATUS",
        "updatedAt": jasmine.any(Date)
      },
      $push: {
        "shipping.$[group].workflow.workflow": "NEW_STATUS"
      }
    },
    {
      arrayFilters: [{ "group._id": "group1" }],
      returnOriginal: false
    }
  );
});
